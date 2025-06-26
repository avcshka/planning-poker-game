import React, { useEffect, useState } from 'react';
import { useTheme } from "next-themes";

const DarkThemeSwitch = () => {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {

    setMounted(true);
  }, []);

  const toggle = () => {
    setTheme(theme === 'dark' ? 'light' : 'dark');
  }

  if (!mounted) return null;

  return (
    <div className="fixed top-4 right-4">
      <label className="switch">
        <input type="checkbox" checked={ theme === "dark" } onChange={ toggle }/>
        <span className="slider round"></span>
      </label>
    </div>
  );
};

export default DarkThemeSwitch;
