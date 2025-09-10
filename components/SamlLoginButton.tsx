import { Button } from "@heroui/button";

export function SamlLoginButton() {
  const handleSamlLogin = () => {
    // Use a form POST to avoid browser prefetching and to support SAML POST bindings
    const form = document.createElement("form");
    form.method = "GET";
    form.action = "/api/auth/saml/login";
    document.body.appendChild(form);
    form.submit();
  };

  return (
    <Button
      className="w-full bg-gradient-to-r from-blue-500 to-indigo-600 text-white font-bold py-3 rounded-lg shadow-lg hover:from-blue-600 hover:to-indigo-700 transition"
      onClick={handleSamlLogin}
    >
      Login with Google Workspace SSO
    </Button>
  );
}
