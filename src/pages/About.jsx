import { Gem, ShieldCheck, Sparkles, Store, ChartColumnBig, Wrench } from 'lucide-react';

const FEATURES = [
  {
    title: 'Inventory Intelligence',
    description: 'Track SKU, purity, gross/net weight, making charges, wastage, and calculated pricing in one flow.',
    icon: Gem,
    color: '#DAA520',
  },
  {
    title: 'Retail + Workshop Operations',
    description: 'Handle billing, customer history, custom orders, and repairs without switching systems.',
    icon: Wrench,
    color: '#3B82F6',
  },
  {
    title: 'Business Visibility',
    description: 'Use dashboards and reports to monitor sales, VAT, stock movement, and pending service items.',
    icon: ChartColumnBig,
    color: '#10B981',
  },
  {
    title: 'Store-Ready Controls',
    description: 'Configure store profile, metal rates, theme preferences, and data backup from settings.',
    icon: Store,
    color: '#8B5CF6',
  },
];

export default function About() {
  return (
    <div className="space-y-6">
      <div className="glass-card-static p-6 md:p-8">
        <div className="flex items-start gap-4">
          <div className="w-12 h-12 rounded-2xl gold-gradient flex items-center justify-center shrink-0">
            <Sparkles size={22} color="#0F0F1A" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-text-primary">About This System</h1>
            <p className="text-sm mt-2 text-text-tertiary max-w-3xl leading-6">
              Jewellery Management System is built for jewellery stores that need precise pricing, fast billing,
              inventory discipline, and clear reporting. It combines day-to-day retail workflows with workshop
              and service operations in a single interface.
            </p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {FEATURES.map((feature) => (
          <div key={feature.title} className="glass-card-static p-5">
            <div className="flex items-start gap-3">
              <div
                className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0"
                style={{ background: `${feature.color}15`, border: `1px solid ${feature.color}30` }}
              >
                <feature.icon size={18} style={{ color: feature.color }} />
              </div>
              <div>
                <h3 className="text-sm font-bold text-text-primary">{feature.title}</h3>
                <p className="text-xs mt-1 text-text-tertiary leading-5">{feature.description}</p>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="glass-card-static p-6">
        <h2 className="text-sm font-bold uppercase tracking-wider text-text-tertiary mb-3">Version & Scope</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          <div className="p-3 rounded-xl bg-bg-primary">
            <p className="text-[11px] font-semibold text-text-tertiary">Product</p>
            <p className="text-sm font-bold text-text-primary mt-1">Jewellery Management System</p>
          </div>
          <div className="p-3 rounded-xl bg-bg-primary">
            <p className="text-[11px] font-semibold text-text-tertiary">Frontend Stack</p>
            <p className="text-sm font-bold text-text-primary mt-1">React + Vite + Tailwind</p>
          </div>
          <div className="p-3 rounded-xl bg-bg-primary">
            <p className="text-[11px] font-semibold text-text-tertiary">Current Scope</p>
            <p className="text-sm font-bold text-text-primary mt-1">POS, Inventory, Reports, Repairs</p>
          </div>
        </div>
      </div>

      <div className="glass-card-static p-5 flex items-start gap-3">
        <ShieldCheck size={18} className="text-emerald-500 mt-0.5" />
        <p className="text-sm text-text-secondary leading-6">
          The application uses browser local storage for demo data persistence and is designed for easy extension
          with API-backed authentication and database integration.
        </p>
      </div>
    </div>
  );
}
