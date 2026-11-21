import {projects} from '../../../lib/projects';
import {notFound} from 'next/navigation';
import Prototype from '../../../components/Prototype';
export function generateStaticParams(){return projects.map(p=>({slug:p.slug}))}
export default async function Play({params}:{params:Promise<{slug:string}>}){const {slug}=await params;const p=projects.find(x=>x.slug===slug);if(!p)notFound();return <Prototype project={p}/>}
