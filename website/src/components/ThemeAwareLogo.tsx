import React from 'react';
import useBaseUrl from '@docusaurus/useBaseUrl';
import { useColorMode } from '@docusaurus/theme-common';

export default function ThemeAwareLogo(): JSX.Element {
  const { colorMode } = useColorMode();
  const lightLogo = useBaseUrl('/img/brand-svg.svg');
  const darkLogo = useBaseUrl('/img/brand-svg-dark.svg');

  return (
    <img
      src={colorMode === 'light' ? lightLogo : darkLogo}
      alt="Seat Picker Logo"
      className="h-8 w-auto transition-opacity duration-200"
    />
  );
}
