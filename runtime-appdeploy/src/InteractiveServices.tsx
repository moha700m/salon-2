import { useId, useState, type KeyboardEvent } from 'react';
import {
  BadgeCheck,
  Droplets,
  Eye,
  Hand,
  MessageCircle,
  Palette,
  Scissors,
  Sparkles,
  WandSparkles,
  ArrowLeft,
} from 'lucide-react';

const SERVICE_ICONS = [
  Scissors,
  Sparkles,
  Eye,
  Droplets,
  Palette,
  Hand,
  WandSparkles,
  BadgeCheck,
] as const;

function normalizePhone(value: string) {
  let digits = value.replace(/\D/g, '');
  if (digits.startsWith('00966')) digits = digits.slice(2);
  if (digits.startsWith('9660')) digits = `966${digits.slice(4)}`;
  if (digits.startsWith('05')) digits = `966${digits.slice(1)}`;
  if (digits.startsWith('5') && digits.length === 9) digits = `966${digits}`;
  return /^9665\d{8}$/.test(digits) ? digits : '';
}

type InteractiveServicesProps = {
  services: string[];
  phone: string;
  businessName: string;
};

export function InteractiveServices({
  services,
  phone,
  businessName,
}: InteractiveServicesProps) {
  const items = services.map((service) => service.trim()).filter(Boolean).slice(0, 8);
  const [activeIndex, setActiveIndex] = useState(0);
  const pickerId = useId();

  if (!items.length) return null;

  const activeService = items[activeIndex] || items[0];
  const ActiveIcon = SERVICE_ICONS[activeIndex % SERVICE_ICONS.length];
  const panelId = `${pickerId}-service-panel`;
  const activeTabId = `${pickerId}-service-tab-${activeIndex}`;
  const normalizedPhone = normalizePhone(phone);
  const bookingMessage = `السلام عليكم، أرغب بحجز خدمة ${activeService} لدى ${businessName}.`;
  const bookingHref = normalizedPhone
    ? `https://wa.me/${normalizedPhone}?text=${encodeURIComponent(bookingMessage)}`
    : '#booking';

  function selectService(index: number) {
    setActiveIndex(Math.max(0, Math.min(index, items.length - 1)));
  }

  function handleKeyDown(event: KeyboardEvent<HTMLButtonElement>, index: number) {
    if (!['ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown', 'Home', 'End'].includes(event.key)) {
      return;
    }

    event.preventDefault();

    if (event.key === 'Home') {
      selectService(0);
      document.getElementById(`${pickerId}-service-tab-0`)?.focus();
      return;
    }

    if (event.key === 'End') {
      const lastIndex = items.length - 1;
      selectService(lastIndex);
      document.getElementById(`${pickerId}-service-tab-${lastIndex}`)?.focus();
      return;
    }

    const direction = event.key === 'ArrowLeft' || event.key === 'ArrowUp' ? -1 : 1;
    const nextIndex = (index + direction + items.length) % items.length;
    selectService(nextIndex);
    document.getElementById(`${pickerId}-service-tab-${nextIndex}`)?.focus();
  }

  return (
    <div className="interactive-services">
      <div
        className="service-orb-list"
        role="tablist"
        aria-label="اختيار خدمة من الصالون"
      >
        {items.map((service, index) => {
          const Icon = SERVICE_ICONS[index % SERVICE_ICONS.length];
          const isActive = index === activeIndex;

          return (
            <button
              key={`${service}-${index}`}
              id={`${pickerId}-service-tab-${index}`}
              className={`service-orb ${isActive ? 'is-active' : ''}`}
              type="button"
              role="tab"
              aria-selected={isActive}
              aria-controls={panelId}
              tabIndex={isActive ? 0 : -1}
              onClick={() => selectService(index)}
              onKeyDown={(event) => handleKeyDown(event, index)}
            >
              <span className="service-orb-ring" aria-hidden="true" />
              <span className="service-orb-icon" aria-hidden="true">
                <Icon size={21} strokeWidth={1.7} />
              </span>
              <span className="service-orb-label">{service}</span>
              <span className="service-orb-index">{String(index + 1).padStart(2, '0')}</span>
            </button>
          );
        })}
      </div>

      <article
        id={panelId}
        className="service-detail"
        role="tabpanel"
        aria-labelledby={activeTabId}
        tabIndex={0}
      >
        <div key={activeIndex} className="service-detail-content">
          <div className="service-detail-icon" aria-hidden="true">
            <ActiveIcon size={38} strokeWidth={1.5} />
          </div>
          <div className="service-detail-copy">
            <span className="service-detail-kicker">الخدمة المختارة</span>
            <h3>{activeService}</h3>
            <p>
              {activeService} بعناية بالتفاصيل وتجربة مريحة تليق بوقتكِ، ويمكنكِ
              الاستفسار والحجز مباشرة من الزر.
            </p>
          </div>
          <a className="primary service-detail-action" href={bookingHref} target={normalizedPhone ? '_blank' : undefined} rel={normalizedPhone ? 'noreferrer' : undefined}>
            <MessageCircle size={17} />
            احجزي هذه الخدمة
            <ArrowLeft size={16} />
          </a>
        </div>
        <div className="service-detail-progress" aria-hidden="true">
          <span style={{ width: `${((activeIndex + 1) / items.length) * 100}%` }} />
        </div>
      </article>
    </div>
  );
}
