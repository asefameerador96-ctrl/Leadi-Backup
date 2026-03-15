import { cn } from "@/lib/utils";
import RankBadge from "./RankBadge";
import { TSOData } from "@/types/leaderboard";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Info } from "lucide-react";

interface TopThreeCardProps {
  rank: 1 | 2 | 3;
  name: string;
  overallPercent: number;
  avatar: string;
  territory: string;
  division: string;
  tsoData: TSOData;
}

const TopThreeCard = ({ rank, name, overallPercent, avatar, territory, division, tsoData }: TopThreeCardProps) => {
  const isFirst = rank === 1;

  return (
    <Popover>
      <PopoverTrigger asChild>
        <div
          className={cn(
            "relative flex flex-col items-center p-8 rounded-3xl transition-all duration-500 cursor-pointer",
            "bg-card border border-border shadow-sm hover:shadow-lg hover:border-accent/50",
            isFirst && "order-2 md:-mt-6 border-accent/30 shadow-accent/10",
            rank === 2 && "order-1",
            rank === 3 && "order-3"
          )}
          style={{
            animationDelay: `${(rank - 1) * 0.1}s`,
          }}
        >
          {/* Avatar */}
          <div className={cn(
            "relative mb-4 rounded-full overflow-hidden border-4 transition-all duration-300",
            isFirst ? "w-28 h-28 border-accent" : "w-24 h-24 border-border",
            rank === 2 && "border-silver",
            rank === 3 && "border-bronze"
          )}>
            <img
              src={avatar}
              alt={name}
              className="w-full h-full object-cover bg-muted"
            />
          </div>

          {/* Rank Badge */}
          <div className={cn(
            "absolute",
            isFirst ? "top-24" : "top-20"
          )} style={{ transform: "translateY(50%)" }}>
            <RankBadge rank={rank} size={isFirst ? "lg" : "md"} />
          </div>

          {/* Name */}
          <h3 className={cn(
            "font-display font-semibold mt-8 mb-1 truncate max-w-full text-foreground",
            isFirst ? "text-xl" : "text-lg"
          )}>
            {name}
          </h3>

          {/* Territory & Division */}
          <div className="text-muted-foreground text-sm mb-4 text-center leading-5">
            <p>{territory}</p>
            <p>{division}</p>
          </div>

          {/* Overall % */}
          <div className="flex items-baseline gap-1">
            <span className={cn(
              "font-display font-bold",
              isFirst ? "text-3xl text-gradient-gold" : "text-2xl text-foreground"
            )}>
              {overallPercent.toFixed(1)}
            </span>
            <span className="text-muted-foreground text-sm">%</span>
          </div>

          {/* Info Icon */}
          <div className="flex items-center gap-1 mt-3 text-muted-foreground hover:text-foreground transition-colors">
            <Info size={14} />
            <span className="text-xs">Hover for details</span>
          </div>
        </div>
      </PopoverTrigger>
      <PopoverContent className="w-80 bg-slate-800 border-slate-700">
        <div className="space-y-3">
          <h4 className="font-semibold text-white">{tsoData.name}</h4>
          <div className="grid grid-cols-2 gap-3 text-sm">
            <div>
              <p className="text-muted-foreground">Wing</p>
              <p className="text-white font-medium">{tsoData.wing}</p>
            </div>
            <div>
              <p className="text-muted-foreground">Overall %</p>
              <p className="text-white font-medium">{tsoData.overallPercent.toFixed(1)}%</p>
            </div>
            <div>
              <p className="text-muted-foreground">Volume Size</p>
              <p className="text-white font-medium">{tsoData.volumeSize}</p>
            </div>
            <div>
              <p className="text-muted-foreground">Memo Size</p>
              <p className="text-white font-medium">{tsoData.memoSize}</p>
            </div>
            <div>
              <p className="text-muted-foreground">PMPD</p>
              <p className="text-white font-medium">{tsoData.pmpd}</p>
            </div>
            <div>
              <p className="text-muted-foreground">Sales/Memo</p>
              <p className="text-white font-medium">{tsoData.salesPerMemo}</p>
            </div>
            <div>
              <p className="text-muted-foreground">Outlet Reach</p>
              <p className="text-white font-medium">{tsoData.outletReach}</p>
            </div>
          </div>
        </div>
      </PopoverContent>
    </Popover>
  );
};

export default TopThreeCard;
