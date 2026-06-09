import { memo } from "react";
import type { Community } from "@/types";

const CATEGORY_SR: Record<string, string> = {
  neighborhood: "Kvart / Komšiluk",
  hobby: "Hobi",
  sport: "Sport",
  food: "Hrana i piće",
  events: "Događaji",
  other: "Ostalo",
};

const TYPE_SR: Record<string, string> = {
  public: "Javna",
  restricted: "Ograničena",
  private: "Privatna",
};

interface Props {
  community: Community;
}

const CommunityAboutTab = memo(({ community }: Props) => (
  <div className="bg-surface border border-border rounded-2xl p-6 shadow-[0_1px_4px_rgba(0,0,0,0.05)]">
    <div className="font-serif text-[18px] text-text-1 mb-4">O zajednici</div>

    {community.description ? (
      <p className="text-[14px] text-text-2 leading-relaxed mb-5">{community.description}</p>
    ) : (
      <p className="text-[13px] text-text-3 italic mb-5">Nema opisa zajednice.</p>
    )}

    <div className="grid grid-cols-2 gap-4 pt-4 border-t border-surface-2">
      <div>
        <div className="text-[10.5px] text-text-3 uppercase tracking-wider font-semibold mb-1">Naziv</div>
        <div className="text-[13px] text-text-1 font-medium">{community.name}</div>
      </div>
      <div>
        <div className="text-[10.5px] text-text-3 uppercase tracking-wider font-semibold mb-1">Kategorija</div>
        <div className="text-[13px] text-text-1 font-medium">
          {CATEGORY_SR[(community as any).category] ?? (community as any).category}
        </div>
      </div>
      <div>
        <div className="text-[10.5px] text-text-3 uppercase tracking-wider font-semibold mb-1">Tip</div>
        <div className="text-[13px] text-text-1 font-medium">{TYPE_SR[(community as any).type]}</div>
      </div>
      {(community as any).location && (
        <div>
          <div className="text-[10.5px] text-text-3 uppercase tracking-wider font-semibold mb-1">Lokacija</div>
          <div className="text-[13px] text-text-1 font-medium">📍 {(community as any).location}</div>
        </div>
      )}
      <div>
        <div className="text-[10.5px] text-text-3 uppercase tracking-wider font-semibold mb-1">Kreirana</div>
        <div className="text-[13px] text-text-1 font-medium">
          {new Date(community.createdAt).toLocaleDateString("sr-RS")}
        </div>
      </div>
    </div>
  </div>
));

export default CommunityAboutTab;
