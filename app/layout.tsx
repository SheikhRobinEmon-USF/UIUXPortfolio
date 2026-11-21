import type { Metadata } from 'next';
import './globals.css';
export const metadata:Metadata={title:'Sheikh Robin Emon — Independent Product Designer',description:'Seven independent product design explorations. Interactive experiences, thoughtful systems and human-centered design.'};
export default function Layout({children}:{children:React.ReactNode}){return <html lang="en"><body><a className="skip" href="#main">Skip to content</a>{children}</body></html>}
