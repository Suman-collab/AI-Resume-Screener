import { useEffect, useRef, useState } from 'react';

const GOOGLE_SCRIPT_ID = 'google-identity-services';
const GOOGLE_CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID;

const loadGoogleScript = () =>
  new Promise((resolve, reject) => {
    const existingScript = document.getElementById(GOOGLE_SCRIPT_ID);

    if (existingScript) {
      if (window.google?.accounts?.id) {
        resolve();
        return;
      }

      existingScript.addEventListener('load', () => resolve(), { once: true });
      existingScript.addEventListener('error', () => reject(new Error('Failed to load Google script')), { once: true });
      return;
    }

    const script = document.createElement('script');
    script.id = GOOGLE_SCRIPT_ID;
    script.src = 'https://accounts.google.com/gsi/client';
    script.async = true;
    script.defer = true;
    script.onload = () => resolve();
    script.onerror = () => reject(new Error('Failed to load Google script'));
    document.body.appendChild(script);
  });

const GoogleAuthButton = ({
  mode = 'signin',
  role = 'user',
  onCredential,
  onError,
  disabled = false,
}) => {
  const buttonRef = useRef(null);
  const [status, setStatus] = useState(GOOGLE_CLIENT_ID ? 'loading' : 'missing_client_id');

  useEffect(() => {
    if (!GOOGLE_CLIENT_ID || disabled) {
      return undefined;
    }

    let cancelled = false;

    loadGoogleScript()
      .then(() => {
        if (cancelled || !buttonRef.current || !window.google?.accounts?.id) {
          return;
        }

        window.google.accounts.id.initialize({
          client_id: GOOGLE_CLIENT_ID,
          auto_select: false,
          cancel_on_tap_outside: true,
          context: mode === 'signup' ? 'signup' : 'signin',
          callback: async ({ credential }) => {
            if (!credential) {
              onError?.('Google did not return a sign-in token');
              return;
            }

            try {
              await onCredential?.(credential, role);
            } catch (error) {
              onError?.(error);
            }
          },
        });

        buttonRef.current.innerHTML = '';
        window.google.accounts.id.renderButton(buttonRef.current, {
          type: 'standard',
          theme: 'outline',
          shape: 'pill',
          size: 'large',
          text: mode === 'signup' ? 'signup_with' : 'continue_with',
          logo_alignment: 'left',
          width: buttonRef.current.offsetWidth || 320,
        });

        setStatus('ready');
      })
      .catch((error) => {
        console.error(error);
        if (!cancelled) {
          setStatus('load_failed');
        }
      });

    return () => {
      cancelled = true;
    };
  }, [disabled, mode, onCredential, onError, role]);

  if (!GOOGLE_CLIENT_ID) {
    return (
      <div className="rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800">
        Add <code>VITE_GOOGLE_CLIENT_ID</code> in the frontend env to enable Google sign-in.
      </div>
    );
  }

  if (status === 'load_failed') {
    return (
      <div className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
        Google sign-in failed to load. Refresh the page and try again.
      </div>
    );
  }

  return (
    <div className="space-y-2">
      <div
        ref={buttonRef}
        className={`min-h-[42px] w-full overflow-hidden rounded-full ${disabled ? 'pointer-events-none opacity-60' : ''}`}
      />
      {status === 'loading' && (
        <p className="text-center text-xs text-slate-500">Preparing Google sign-in...</p>
      )}
    </div>
  );
};

export default GoogleAuthButton;
