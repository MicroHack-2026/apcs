import { cn } from "@/lib/utils";

interface LoginBackgroundProps {
  className?: string;
}

export function LoginBackground({ className }: LoginBackgroundProps) {
  return (
    <div className={cn("fixed inset-0 overflow-hidden pointer-events-none", className)}>
      <div
        className="absolute inset-0"
        style={{
          backgroundImage: `
            linear-gradient(to right, hsl(220 13% 91% / 0.4) 1px, transparent 1px),
            linear-gradient(to bottom, hsl(220 13% 91% / 0.4) 1px, transparent 1px)
          `,
          backgroundSize: '80px 80px',
        }}
      />

      <div className="absolute inset-0">
        <div
          className="absolute -top-10 -left-10 w-64 h-40 rounded-2xl rotate-12 animate-float-slow"
          style={{
            backgroundColor: 'hsl(233 100% 67% / 0.04)',
            border: '1px solid hsl(233 100% 67% / 0.08)',
          }}
        />

        <div
          className="absolute top-20 right-20 animate-float-medium"
          style={{
            width: 0,
            height: 0,
            borderLeft: '60px solid transparent',
            borderRight: '60px solid transparent',
            borderBottom: '100px solid hsl(233 100% 67% / 0.04)',
            transform: 'rotate(-15deg)',
          }}
        />

        <div
          className="absolute top-1/3 right-1/4 w-20 h-20 rounded-xl rotate-45 animate-float-fast"
          style={{
            backgroundColor: 'hsl(220 13% 10% / 0.02)',
            border: '1px solid hsl(220 13% 10% / 0.04)',
          }}
        />

        <div
          className="absolute bottom-32 left-16 w-48 h-24 rounded-2xl -rotate-6 animate-float-medium"
          style={{
            backgroundColor: 'hsl(233 100% 67% / 0.03)',
            border: '1px solid hsl(233 100% 67% / 0.06)',
          }}
        />

        <div
          className="absolute bottom-20 right-32 w-32 h-32 rounded-full animate-float-slow"
          style={{
            backgroundColor: 'hsl(236 95% 36% / 0.03)',
            border: '1px solid hsl(236 95% 36% / 0.05)',
          }}
        />

        <div
          className="absolute top-16 left-1/3 w-80 h-12 rounded-xl rotate-3 animate-float-medium"
          style={{
            backgroundColor: 'hsl(233 100% 67% / 0.02)',
            border: '1px solid hsl(233 100% 67% / 0.04)',
          }}
        />

        <div
          className="absolute bottom-40 left-1/2 w-28 h-28 rounded-2xl -rotate-12 animate-float-slow"
          style={{
            backgroundColor: 'hsl(220 13% 10% / 0.015)',
            border: '1px solid hsl(220 13% 10% / 0.03)',
          }}
        />
      </div>
    </div>
  );
}
