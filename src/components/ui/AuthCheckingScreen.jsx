const LOGO_URL = "/images/Logo%20Fizzia.svg";

export default function AuthCheckingScreen() {
  return (
    <div className="grid min-h-screen place-items-center bg-white px-4 py-10 dark:bg-[#0b1220]">
      <img alt="Fizzia" className="auth-checking-logo h-28 w-28 object-contain" src={LOGO_URL} />
    </div>
  );
}
