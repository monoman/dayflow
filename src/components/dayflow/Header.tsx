import { ListChecks } from 'lucide-react';

export default function Header() {
  return (
    <header className="p-4 sm:p-6 border-b border-border">
      <div className="container mx-auto flex items-right gap-3">
        <ListChecks className="h-8 w-8 text-primary" />
        <h1 className="text-3xl font-headline font-bold text-primary">DayFlow</h1>
      </div>
    </header>
  );
}
