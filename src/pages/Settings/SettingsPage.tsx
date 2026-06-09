import ProfileSection from "./ProfileSection";
import NotificationsSection from "./NotificationsSection";
import ThemeSection from "./ThemeSection";
import TwoFactorSection from "./TwoFactorSection";

const SECTIONS = [
  { label: "Profil",       Component: ProfileSection },
  { label: "Obaveštenja",  Component: NotificationsSection },
  { label: "Izgled",       Component: ThemeSection },
  { label: "Bezbednost",   Component: TwoFactorSection },
];

const SettingsPage = () => (
  <div className="max-w-2xl mx-auto">
    <div className="font-serif text-[24px] text-text-1 mb-1">Podešavanja</div>
    <p className="text-[13px] text-text-3 mb-6">Upravljaj nalogom i podešavanjima</p>

    <div className="flex flex-col gap-6">
      {SECTIONS.map(({ label, Component }) => (
        <div key={label}>
          <div className="text-[11px] font-semibold text-text-3 uppercase tracking-[0.12em] mb-3 px-1">
            {label}
          </div>
          <Component />
        </div>
      ))}
    </div>
  </div>
);

export default SettingsPage;
