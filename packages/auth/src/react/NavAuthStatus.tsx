import { useAuth } from './useAuth';
import { Button } from '@heroui/button';

export const NavAuthStatus = () => {
  const { user, signOut } = useAuth();

  if (!user) {
    return (
      <div className="flex gap-2">
        <Button as="a" href="/auth/signin" variant="ghost">
          Sign In
        </Button>
        <Button as="a" href="/auth/signup" color="primary">
          Sign Up
        </Button>
      </div>
    );
  }

  return (
    <div className="flex items-center gap-2">
      <span className="text-sm text-default-600">
        {user.displayName || user.email}
      </span>
      <Button
        size="sm"
        variant="ghost"
        onPress={() => signOut()}
      >
        Sign Out
      </Button>
    </div>
  );
};