"use client";

import { useEffect } from 'react';

interface DynamicTitleProps {
  section?: string;
}

export default function DynamicTitle({ section }: DynamicTitleProps) {
  useEffect(() => {
    const updateTitle = async () => {
      try {
        const res = await fetch('/api/settings');
        if (res.ok) {
          const data = await res.json();
          const siteName = data.site_name || 'Microblog';
          const title = section ? `${section} | ${siteName}` : siteName;
          document.title = title;
        }
      } catch (error) {
        console.error('Error fetching site name for title:', error);
        const title = section ? `${section} | Microblog` : 'Microblog';
        document.title = title;
      }
    };

    updateTitle();
  }, [section]);

  return null; // This component doesn't render anything
} 