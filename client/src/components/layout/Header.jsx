function Header({ title = "Dashboard" }) {
  return (
    <header className="flex min-h-16 items-center justify-between border-b border-gray-200 bg-white px-6">
      <h1 className="text-lg font-semibold text-gray-900">
        {title}
      </h1>

      <div className="flex items-center">
        <span className="text-sm text-gray-700">
          User
        </span>
      </div>
    </header>
  );
}

export default Header;