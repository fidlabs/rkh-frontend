import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

interface RoleCardProps {
  icon: React.ReactNode;
  title: string;
  description: string;
  buttonText: string;
  onClick: (Role: string) => void;
}

export default function RoleCard({ icon, title, description, buttonText, onClick }: RoleCardProps) {
  return (
    <Card className="flex-1">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <div className="h-5 w-5">{icon}</div>
          {title}
        </CardTitle>
      </CardHeader>
      <CardContent className="h-[72px]">
        <p className="text-sm text-muted-foreground">{description}</p>
      </CardContent>
      <CardFooter>
        <Button className="w-full" onClick={() => onClick('root')}>
          {buttonText}
        </Button>
      </CardFooter>
    </Card>
  );
}
