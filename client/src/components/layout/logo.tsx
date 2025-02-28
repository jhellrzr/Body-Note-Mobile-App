import { Heart } from "lucide-react";
import { useTranslation } from 'react-i18next';

export default function Logo() {
  const { t } = useTranslation();

  return (
    <div className="flex items-center justify-between w-full">
      <div className="flex items-center gap-2">
        <div className="flex items-center justify-center w-9 h-9 rounded-xl bg-primary/10">
          <Heart className="w-5 h-5 text-primary" />
        </div>
        <div className="flex flex-col">
          <span className="font-semibold text-xl tracking-tight text-foreground">
            {t('app.name')}
          </span>
          <span className="text-xs text-muted-foreground leading-none">
            {t('app.tagline')}
          </span>
        </div>
      </div>
      <span className="text-xs text-muted-foreground hidden md:block">
        Made with <Heart className="w-3 h-3 inline text-red-500" /> in San Francisco
      </span>
    </div>
  );
}