import { useEffect, useRef, useState } from 'react';
import { ArrowLeft, Bot, Loader2, SendHorizonal, Sparkles, User2 } from 'lucide-react';
import { assistantChatAPI } from '../services/api';

const QUICK_PROMPTS = [
  'How can I improve my chances for the jobs I already applied to?',
  'Suggest the next 3 skills I should learn based on my dashboard.',
  'Which kind of roles should I focus on right now?',
];

const WELCOME_PROMPT =
  'Give me a short, warm welcome for a career copilot chat inside a resume screener app. Mention resumes, applications, and job strategy. Keep it under 70 words.';

const LIST_MARKER_REGEX = /^(\d+[\.\)]|[-*•])\s+/;
const KEY_VALUE_REGEX = /^([A-Za-z][A-Za-z/&(),\-\s]{1,40}):\s+(.+)$/;

const createAssistantMessage = (content, meta = {}) => ({
  id: `assistant-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
  role: 'assistant',
  content,
  meta: {
    provider: 'groq',
    label: 'Groq reply',
    ...meta,
  },
});

const cleanMessageText = (value) =>
  String(value || '')
    .replace(/\r/g, '')
    .replace(/â€¢/g, '•')
    .replace(/â€“|â€”/g, '-')
    .trim();

const stripMarkdownHeadingMarkers = (value) =>
  String(value || '')
    .split('\n')
    .map((line) => line.replace(/^\s{0,3}#{1,6}\s*/, ''))
    .join('\n');

const stripCodeFence = (value) => {
  const trimmed = cleanMessageText(value);
  const match = trimmed.match(/^```(?:json|text)?\s*([\s\S]*?)\s*```$/i);
  return match ? match[1].trim() : trimmed;
};

const parseJsonMessage = (value) => {
  if (typeof value !== 'string') return null;
  const trimmed = stripCodeFence(value);
  if (!trimmed || !['{', '['].includes(trimmed[0])) {
    return null;
  }

  try {
    return JSON.parse(trimmed);
  } catch {
    return null;
  }
};

const toTitleCase = (value) =>
  String(value || '')
    .replace(/[_-]+/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
    .replace(/\b\w/g, (char) => char.toUpperCase());

const renderInlineText = (text) => {
  const tokens = String(text || '').split(/(`[^`]+`|\*\*[^*]+\*\*)/g);

  return tokens.filter(Boolean).map((token, index) => {
    if (token.startsWith('`') && token.endsWith('`')) {
      return (
        <code
          key={`${token}-${index}`}
          className="rounded-md bg-slate-100 px-1.5 py-0.5 font-medium text-slate-700"
        >
          {token.slice(1, -1)}
        </code>
      );
    }

    if (token.startsWith('**') && token.endsWith('**')) {
      return (
        <strong key={`${token}-${index}`} className="font-semibold text-slate-900">
          {token.slice(2, -2)}
        </strong>
      );
    }

    return token;
  });
};

const renderList = (lines, ordered, keyPrefix) => {
  const ListTag = ordered ? 'ol' : 'ul';

  return (
    <ListTag className="space-y-2.5">
      {lines.map((line, index) => {
        const body = cleanMessageText(line).replace(LIST_MARKER_REGEX, '');
        return (
          <li key={`${keyPrefix}-${index}`} className="flex items-start gap-3 rounded-2xl border border-slate-100 bg-slate-50/80 px-4 py-3">
            {ordered ? (
              <span className="mt-0.5 inline-flex h-6 min-w-6 items-center justify-center rounded-full bg-slate-900 px-1.5 text-xs font-semibold text-white">
                {index + 1}
              </span>
            ) : (
              <span className="mt-2 h-2 w-2 rounded-full bg-indigo-500" />
            )}
            <span className="text-[15px] leading-7 text-slate-700">{renderInlineText(body)}</span>
          </li>
        );
      })}
    </ListTag>
  );
};

const renderKeyValueRows = (lines, keyPrefix) => (
  <div className="space-y-2.5">
    {lines.map((line, index) => {
      const [, label = '', value = line] = line.match(KEY_VALUE_REGEX) || [];
      return (
        <div
          key={`${keyPrefix}-${index}`}
          className="rounded-2xl border border-slate-100 bg-slate-50/80 px-4 py-3"
        >
          <p className="mb-1 text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">
            {label}
          </p>
          <p className="text-[15px] leading-7 text-slate-700">{renderInlineText(value)}</p>
        </div>
      );
    })}
  </div>
);

const renderJsonValue = (value, keyPrefix, title = '') => {
  if (Array.isArray(value)) {
    const lines = value.map((item) => (typeof item === 'string' ? item : JSON.stringify(item))).filter(Boolean);
    return (
      <div className="space-y-3">
        {title && <h4 className="text-sm font-semibold tracking-wide text-slate-900">{title}</h4>}
        {renderList(lines, true, `${keyPrefix}-list`)}
      </div>
    );
  }

  if (value && typeof value === 'object') {
    const entries = Object.entries(value);
    return (
      <div className="space-y-4">
        {title && <h4 className="text-sm font-semibold tracking-wide text-slate-900">{title}</h4>}
        {entries.map(([key, nestedValue], index) => (
          <div key={`${keyPrefix}-${key}-${index}`} className="space-y-2">
            {renderJsonValue(nestedValue, `${keyPrefix}-${key}-${index}`, toTitleCase(key))}
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-2">
      {title && <h4 className="text-sm font-semibold tracking-wide text-slate-900">{title}</h4>}
      <p className="text-[15px] leading-7 text-slate-700">{renderInlineText(String(value || ''))}</p>
    </div>
  );
};

const renderTextBlock = (block, blockIndex) => {
  const lines = block.split('\n').map((line) => line.trim()).filter(Boolean);
  if (!lines.length) return null;

  const numbered = lines.every((line) => /^\d+[\.\)]\s+/.test(line));
  if (numbered) {
    return renderList(lines, true, `numbered-${blockIndex}`);
  }

  const bulleted = lines.every((line) => /^[-*•]\s+/.test(line));
  if (bulleted) {
    return renderList(lines, false, `bulleted-${blockIndex}`);
  }

  const keyValueLines = lines.length > 1 && lines.every((line) => KEY_VALUE_REGEX.test(line));
  if (keyValueLines) {
    return renderKeyValueRows(lines, `kv-${blockIndex}`);
  }

  if (
    lines.length > 1 &&
    !LIST_MARKER_REGEX.test(lines[0]) &&
    /^(#{1,3}\s+)?[A-Z][^.!?]{0,70}:?$/.test(lines[0])
  ) {
    const headingText = lines[0].replace(/^#{1,3}\s*/, '').replace(/:$/, '');
    const rest = lines.slice(1);
    return (
      <div className="space-y-3">
        <h4 className="text-sm font-semibold tracking-wide text-slate-900">
          {renderInlineText(headingText)}
        </h4>
        {rest.every((line) => LIST_MARKER_REGEX.test(line))
          ? renderList(rest, rest.every((line) => /^\d+[\.\)]\s+/.test(line)), `section-list-${blockIndex}`)
          : rest.map((line, index) => (
              <p key={`section-paragraph-${blockIndex}-${index}`} className="text-[15px] leading-7 text-slate-700">
                {renderInlineText(line)}
              </p>
            ))}
      </div>
    );
  }

  return (
    <div className="space-y-2">
      {lines.map((line, index) => (
        <p key={`paragraph-${blockIndex}-${index}`} className="text-[15px] leading-7 text-slate-700">
          {renderInlineText(line)}
        </p>
      ))}
    </div>
  );
};

const renderMessageBody = (content, isAssistant) => {
  if (!isAssistant) {
    return <div className="whitespace-pre-wrap">{content}</div>;
  }

  const parsedJson = parseJsonMessage(content);
  if (parsedJson !== null) {
    return <div className="space-y-4">{renderJsonValue(parsedJson, 'assistant-json')}</div>;
  }

  const blocks = cleanMessageText(content)
    .split(/\n\s*\n/)
    .map((block) => block.trim())
    .filter(Boolean);

  return <div className="space-y-4">{blocks.map((block, index) => <div key={`block-${index}`}>{renderTextBlock(block, index)}</div>)}</div>;
};

const AssistantChatPanel = ({ fullScreen = false, onBack }) => {
  const [prompt, setPrompt] = useState('');
  const [messages, setMessages] = useState([]);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isBootstrapping, setIsBootstrapping] = useState(true);
  const listRef = useRef(null);
  const hasUserSentMessageRef = useRef(false);

  useEffect(() => {
    if (!listRef.current) {
      return;
    }

    listRef.current.scrollTop = listRef.current.scrollHeight;
  }, [messages, isLoading]);

  useEffect(() => {
    let isActive = true;

    const loadGroqWelcome = async () => {
      try {
        const response = await assistantChatAPI(WELCOME_PROMPT, []);

        if (!isActive || hasUserSentMessageRef.current) {
          return;
        }

        setMessages([
          createAssistantMessage(
            stripMarkdownHeadingMarkers(response.data?.answer || 'Ask me anything about your job strategy, resume, or applications.'),
            {
              model: response.data?.model || '',
            }
          ),
        ]);
      } catch (_) {
        if (!isActive || hasUserSentMessageRef.current) {
          return;
        }

        setMessages([
          createAssistantMessage(
            'Ask me anything about your applications, resume strategy, or what roles to target next. I will answer using your dashboard context.',
            {
              label: 'Groq unavailable',
            }
          ),
        ]);
      } finally {
        if (isActive) {
          setIsBootstrapping(false);
        }
      }
    };

    loadGroqWelcome();

    return () => {
      isActive = false;
    };
  }, []);

  const submitPrompt = async (nextPrompt) => {
    const text = String(nextPrompt || prompt).trim();

    if (!text || isLoading) {
      return;
    }

    hasUserSentMessageRef.current = true;

    const userMessage = {
      id: `user-${Date.now()}`,
      role: 'user',
      content: text,
    };

    const nextMessages = [...messages, userMessage];
    setMessages(nextMessages);
    setPrompt('');
    setError('');
    setIsLoading(true);

    try {
      const response = await assistantChatAPI(
        text,
        nextMessages.map((message) => ({
          role: message.role,
          content: message.content,
        }))
      );

      setMessages((current) => [
        ...current,
        createAssistantMessage(
          stripMarkdownHeadingMarkers(response.data?.answer || 'No response received from the assistant.'),
          {
            provider: response.data?.provider || 'groq',
            model: response.data?.model || '',
          }
        ),
      ]);
    } catch (err) {
      const nextError = err?.response?.data?.message || 'The assistant is unavailable right now.';
      setError(nextError);
      setMessages((current) => [
        ...current,
        createAssistantMessage(`I could not complete that request.\n\n${nextError}`, {
          label: 'Groq unavailable',
        }),
      ]);
    } finally {
      setIsLoading(false);
      setIsBootstrapping(false);
    }
  };

  return (
    <div
      className={`overflow-hidden border border-gray-100 bg-white shadow-sm ${
        fullScreen ? 'flex h-[calc(100vh-1rem)] flex-col rounded-[1.75rem]' : 'rounded-[2rem]'
      }`}
    >
      <div className={`bg-slate-900 text-white ${fullScreen ? 'px-4 py-2.5 sm:px-5' : 'px-6 py-5'}`}>
        <div className={`flex justify-between gap-4 ${fullScreen ? 'items-center' : 'items-start'}`}>
          <div className={fullScreen ? 'flex min-w-0 items-center gap-3' : ''}>
            {fullScreen && onBack && (
              <button
                type="button"
                onClick={onBack}
                className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-white/10 text-slate-200 transition-colors hover:bg-white/16 hover:text-white"
                aria-label="Go back"
              >
                <ArrowLeft className="h-4 w-4" />
              </button>
            )}
            <div
              className={`inline-flex items-center gap-2 rounded-full bg-white/10 px-3 py-1 text-xs font-semibold uppercase tracking-[0.24em] text-slate-200 ${
                fullScreen ? 'shrink-0' : 'mb-3'
              }`}
            >
              <Sparkles className="h-3.5 w-3.5" />
              Groq Chat
            </div>
            <div className={fullScreen ? 'min-w-0' : ''}>
              <h2 className={`${fullScreen ? 'text-sm sm:text-base' : 'text-2xl'} font-bold`}>
                {fullScreen ? 'AI career copilot' : 'Your AI career copilot'}
              </h2>
              <p className={`text-slate-300 ${fullScreen ? 'truncate text-[11px]' : 'mt-1 text-sm'}`}>
                Chat with Groq using your current applications and job feed as context.
              </p>
            </div>
          </div>
          <div
            className={`flex shrink-0 items-center justify-center rounded-2xl bg-white/10 ${
              fullScreen ? 'h-8 w-8' : 'h-12 w-12'
            }`}
          >
            <Bot className={fullScreen ? 'h-4 w-4' : 'h-5 w-5'} />
          </div>
        </div>
      </div>

      <div className={`border-b border-gray-100 ${fullScreen ? 'px-4 py-2.5 sm:px-5' : 'px-5 pb-2 pt-4'}`}>
        <div className={`flex flex-wrap ${fullScreen ? 'gap-1.5' : 'gap-2'}`}>
          {QUICK_PROMPTS.map((item) => (
            <button
              key={item}
              type="button"
              onClick={() => submitPrompt(item)}
              disabled={isLoading}
              className={`rounded-full border border-gray-200 bg-gray-50 font-medium text-gray-600 transition-colors hover:border-indigo-200 hover:text-gray-900 disabled:opacity-60 ${
                fullScreen ? 'px-3 py-1.5 text-[11px] sm:text-xs' : 'px-3 py-2 text-xs sm:text-sm'
              }`}
            >
              {item}
            </button>
          ))}
        </div>
      </div>

      <div
        ref={listRef}
        className={`overflow-y-auto bg-[linear-gradient(180deg,#f8fafc_0%,#ffffff_100%)] ${
          fullScreen ? 'flex-1' : 'h-[28rem]'
        }`}
      >
        <div className={`w-full ${fullScreen ? 'h-full px-4 py-4 sm:px-6 lg:px-8' : 'space-y-4 px-4 py-5 sm:px-6'}`}>
          <div className={`${fullScreen ? 'flex min-h-full flex-col gap-5' : 'space-y-4'}`}>
            {messages.map((message) => {
              const isAssistant = message.role === 'assistant';
              const shouldStretchMessage = fullScreen && messages.length === 1 && isAssistant;

              return (
                <div
                  key={message.id}
                  className={`flex items-start ${fullScreen ? 'gap-4' : 'gap-3'} ${
                    isAssistant ? (fullScreen ? 'w-full' : '') : 'justify-end'
                  } ${shouldStretchMessage ? 'flex-1' : ''}`}
                >
                  {isAssistant && (
                    <div
                      className={`mt-1 flex shrink-0 items-center justify-center rounded-2xl bg-slate-900 text-white ${
                        fullScreen ? 'h-10 w-10' : 'h-9 w-9'
                      }`}
                    >
                      <Bot className="h-4 w-4" />
                    </div>
                  )}

                  <div
                    className={`rounded-3xl text-sm leading-7 shadow-sm ${
                      isAssistant
                        ? `border border-slate-200/80 bg-[linear-gradient(180deg,#ffffff_0%,#f8fbff_100%)] text-gray-700 shadow-[0_16px_35px_rgba(15,23,42,0.06)] ${
                            fullScreen
                              ? `${shouldStretchMessage ? 'h-full min-h-[26rem]' : 'min-h-[18rem]'} w-full flex-1 px-5 py-5`
                              : 'max-w-[85%] px-4 py-3'
                          }`
                        : `${fullScreen ? 'max-w-[84%] px-5 py-4 xl:max-w-[80%]' : 'max-w-[85%] px-4 py-3'} bg-indigo-600 text-white`
                    }`}
                  >
                    {isAssistant && (
                      <div className="mb-3 flex flex-wrap items-center gap-2 border-b border-slate-100 pb-2.5">
                        <span className="rounded-full bg-slate-900 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.2em] text-white">
                          {message.meta?.label || 'Assistant'}
                        </span>
                        {message.meta?.model && (
                          <span className="rounded-full bg-indigo-50 px-2.5 py-1 text-[11px] font-medium text-indigo-700">
                            {message.meta.model}
                          </span>
                        )}
                      </div>
                    )}

                    {renderMessageBody(message.content, isAssistant)}
                  </div>

                  {!isAssistant && (
                    <div
                      className={`mt-1 flex shrink-0 items-center justify-center rounded-2xl bg-indigo-100 text-indigo-700 ${
                        fullScreen ? 'h-10 w-10' : 'h-9 w-9'
                      }`}
                    >
                      <User2 className="h-4 w-4" />
                    </div>
                  )}
                </div>
              );
            })}

            {(isLoading || isBootstrapping) && (
              <div className={`flex items-start ${fullScreen ? 'w-full gap-4' : 'gap-3'}`}>
                <div
                  className={`mt-1 flex shrink-0 items-center justify-center rounded-2xl bg-slate-900 text-white ${
                    fullScreen ? 'h-10 w-10' : 'h-9 w-9'
                  }`}
                >
                  <Bot className="h-4 w-4" />
                </div>
                <div
                  className={`rounded-3xl border border-gray-100 bg-white shadow-sm ${
                    fullScreen ? 'w-full flex-1 px-5 py-4' : 'px-4 py-3'
                  }`}
                >
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <Loader2 className="h-4 w-4 animate-spin" />
                    {isBootstrapping ? 'Groq is getting ready...' : 'Groq is thinking...'}
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      <div className={`border-t border-gray-100 bg-white ${fullScreen ? 'px-4 py-2 sm:px-6' : 'px-4 py-4 sm:px-6'}`}>
        <div className={`rounded-[1.75rem] border border-gray-200 bg-gray-50 ${fullScreen ? 'w-full p-2' : 'p-2'}`}>
          <textarea
            value={prompt}
            onChange={(event) => setPrompt(event.target.value)}
            onKeyDown={(event) => {
              if (event.key === 'Enter' && !event.shiftKey) {
                event.preventDefault();
                submitPrompt();
              }
            }}
            rows={fullScreen ? 1 : 3}
            placeholder="Ask about your resume strategy, job search, or next steps..."
            className={`w-full resize-none border-none bg-transparent px-3 text-sm text-gray-700 outline-none placeholder:text-gray-400 ${
              fullScreen ? 'py-1.5' : 'py-2'
            }`}
          />
          <div className={`flex items-center justify-between gap-3 px-2 ${fullScreen ? 'pb-0.5' : 'pb-1'}`}>
            <p className="text-xs text-gray-400">Press Enter to send, Shift + Enter for a new line.</p>
            <button
              type="button"
              onClick={() => submitPrompt()}
              disabled={isLoading || !prompt.trim()}
              className="inline-flex items-center gap-2 rounded-full bg-slate-900 px-4 py-2 text-sm font-semibold text-white transition-all hover:bg-indigo-600 disabled:bg-slate-400"
            >
              {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <SendHorizonal className="h-4 w-4" />}
              Send
            </button>
          </div>
        </div>

        {error && (
          <div className="mt-3 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            {error}
          </div>
        )}
      </div>
    </div>
  );
};

export default AssistantChatPanel;
