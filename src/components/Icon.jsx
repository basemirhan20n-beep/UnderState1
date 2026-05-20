const ICON_MAP = {
  money:         '/assets/icons/money.svg',
  bank:          '/assets/icons/bank.svg',
  government:    '/assets/icons/government.svg',
  user:          '/assets/icons/user.svg',
  briefcase:     '/assets/icons/briefcase.svg',
  settings:      '/assets/icons/settings.svg',
  crown:         '/assets/icons/crown.svg',
  vote:          '/assets/icons/vote.svg',
  law:           '/assets/icons/law.svg',
  chart:         '/assets/icons/chart.svg',
  weapon:        '/assets/icons/weapon.svg',
  map:           '/assets/icons/map.svg',
  education:     '/assets/icons/education.svg',
  truck:         '/assets/icons/truck.svg',
  factory:       '/assets/icons/factory.svg',
  'job-trash':   '/assets/icons/jobs/trash.svg',
  'job-chef':    '/assets/icons/jobs/chef.svg',
  'job-porter':  '/assets/icons/jobs/porter.svg',
  'job-warehouse':'/assets/icons/jobs/warehouse.svg',
  'job-miner':   '/assets/icons/jobs/miner.svg',
  'job-engineer':'/assets/icons/jobs/engineer.svg',
  'job-doctor':  '/assets/icons/jobs/doctor.svg',
  'job-programmer':'/assets/icons/jobs/programmer.svg',
  'job-pilot':   '/assets/icons/jobs/pilot.svg',
};

export function Icon({ name, size = 24, className = '', style = {} }) {
  const src = ICON_MAP[name];
  if (!src) return null;
  return (
    <img
      src={src}
      alt={name}
      width={size}
      height={size}
      className={className}
      style={{ display: 'inline-block', flexShrink: 0, ...style }}
    />
  );
}

export { ICON_MAP };
export default Icon;
