import { useNavigate } from 'react-router-dom';
import AssistantChatPanel from '../../components/AssistantChatPanel';

const AskDoubt = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen px-2 py-2 sm:px-3 sm:py-3">
      <div className="mx-auto flex min-h-[calc(100vh-1rem)] max-w-[1600px] flex-col">
        <div className="flex-1">
          <AssistantChatPanel fullScreen onBack={() => navigate(-1)} />
        </div>
      </div>
    </div>
  );
};

export default AskDoubt;
