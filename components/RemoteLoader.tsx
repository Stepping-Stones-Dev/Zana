import React, { Suspense } from 'react';
import styles from '../styles/RemoteLoader.module.css';
import { Spinner } from '@heroui/spinner';
import { Card } from '@heroui/card';

// App registry for dynamic microfrontend registration
type AppEntry = { name: string; url: string; module: string };
const appRegistry: Record<string, AppEntry> = {};

// Register initial manifest apps
import manifest from '../lib/manifest.json';
manifest.forEach((entry: AppEntry) => {
  appRegistry[entry.name] = entry;
});

// Function to register new apps at runtime
export function registerApp(entry: AppEntry) {
  appRegistry[entry.name] = entry;
}

type RemoteLoaderProps = {
  app: string;
};

const RemoteLoader: React.FC<RemoteLoaderProps> = ({ app }) => {
  const entry = appRegistry[app];

  const [ready, setReady] = React.useState(false);
  const [isClient, setIsClient] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  React.useEffect(() => {
    setIsClient(typeof window !== 'undefined');
  }, []);

  React.useEffect(() => {
    setError(null);
    if (!isClient || !entry) return;
    let cancelled = false;
    // @ts-ignore
    if (!window[entry.name]) {
      import(/* webpackIgnore: true */ entry.url)
        .then(() => {
          if (!cancelled) setReady(true);
        })
        .catch((e) => {
          if (!cancelled) {
            setReady(false);
            setError(`Failed to load ${app}: ${e?.message || 'Unknown error'}`);
          }
        });
    } else {
      setReady(true);
    }
    return () => {
      cancelled = true;
    };
  }, [isClient, entry && entry.name, entry && entry.url]);

  const RemoteComp = React.useMemo(
    () =>
      isClient && entry
        ? React.lazy(() =>
            // @ts-ignore
            window[entry.name].get(entry.module).then((factory: any) => {
              const Mod = factory();
              return { default: Mod.default || Mod };
            })
          )
        : null,
    [isClient, entry && entry.name, entry && entry.module]
  );

  if (!entry)
    return (
      <Card className="p-6 text-center text-red-600 font-semibold">
        Unknown app: {app}
      </Card>
    );
  if (error)
    return (
      <Card className="p-6 text-center text-red-600 font-semibold">
        {error}
      </Card>
    );
  if (!isClient || !ready || !RemoteComp)
    return (
      <Card className="flex flex-col items-center justify-center p-8">
        <Spinner size="lg" color="primary" />
        <div className="mt-4 text-lg font-medium text-gray-700">
          Loading{' '}
          <span className="font-bold">{app}</span>…
        </div>
      </Card>
    );

  return (
    <div className={styles.container}>
      <Suspense
        fallback={
          <Card className="flex flex-col items-center justify-center p-8">
            <Spinner size="lg" color="primary" />
            <div className="mt-4 text-lg font-medium text-gray-700">
              Loading{' '}
              <span className="font-bold">{app}</span>…
            </div>
          </Card>
        }
      >
        <RemoteComp />
      </Suspense>
    </div>
  );
};

export default RemoteLoader;
