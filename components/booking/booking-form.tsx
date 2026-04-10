'use client';

import { addDays, format } from 'date-fns';
import { useMemo, useState, type CSSProperties, type FormEvent } from 'react';
import {
  ArrowRight,
  CalendarDays,
  CheckCircle2,
  ChevronLeft,
  ChevronsUpDown,
  Clock3,
} from 'lucide-react';
import type { Booking, BookingFormValues, MasterProfile } from '@/lib/types';
import { useApp } from '@/lib/app-context';
import { useAppearance } from '@/lib/appearance-context';
import { getPublicButtonClassName } from '@/lib/appearance';
import { accentPalette } from '@/lib/appearance-palette';
import { useLocale } from '@/lib/locale-context';
import { cn, formatDate } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Textarea } from '@/components/ui/textarea';

const initialValues: BookingFormValues = {
  clientName: '',
  clientPhone: '',
  service: '',
  date: '',
  time: '',
  comment: '',
};

const timeSlots = ['09:00', '10:30', '12:00', '13:30', '15:00', '17:00', '18:30', '20:00'];


function StepLabel({
  label,
  active,
  complete,
}: {
  label: string;
  active: boolean;
  complete: boolean;
}) {
  return (
    <div
      className={cn(
        'flex items-center justify-center gap-1.5 rounded-full border px-2 py-1.5 text-[10px] font-medium transition sm:text-[10.5px]',
        active
          ? 'border-primary/18 bg-primary/10 text-foreground shadow-[0_1px_0_rgba(255,255,255,0.38)_inset]'
          : complete
            ? 'border-border/80 bg-background/60 text-foreground/84'
            : 'border-border/70 bg-background/38 text-muted-foreground',
      )}
    >
      <span
        className={cn(
          'size-2 rounded-full transition',
          active ? 'bg-primary shadow-[0_0_10px_var(--primary)]' : complete ? 'bg-foreground/40' : 'bg-border',
        )}
      />
      <span className="truncate">{label}</span>
    </div>
  );
}

function SelectionChip({
  label,
  active,
  onClick,
  compact = false,
  style,
}: {
  label: string;
  active: boolean;
  onClick: () => void;
  compact?: boolean;
  style?: CSSProperties;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        'rounded-[14px] border text-left transition-[transform,background-color,border-color,color,box-shadow] duration-200 hover:-translate-y-[1px]',
        compact ? 'px-2.5 py-2 text-[11.5px]' : 'px-3 py-2.5 text-[12px]',
        active
          ? 'text-foreground shadow-[0_10px_18px_rgba(15,23,42,0.05)]'
          : 'border-border/80 bg-background/60 text-muted-foreground hover:border-primary/18 hover:bg-accent/14 hover:text-foreground',
      )}
      style={active ? style : undefined}
    >
      {label}
    </button>
  );
}

export function BookingForm({ profile, embedded = false }: { profile: MasterProfile; embedded?: boolean }) {
  const { createBooking } = useApp();
  const { settings } = useAppearance();
  const { locale } = useLocale();
  const [values, setValues] = useState<BookingFormValues>(initialValues);
  const [currentStep, setCurrentStep] = useState(0);
  const [serviceMenuOpen, setServiceMenuOpen] = useState(false);
  const [serviceQuery, setServiceQuery] = useState('');
  const [submittedBooking, setSubmittedBooking] = useState<Booking | null>(null);
  const [error, setError] = useState<string | null>(null);

  const accent = accentPalette[settings.publicAccent];

  const steps = locale === 'ru' ? ['Услуга', 'Дата и время', 'Контакты'] : ['Service', 'Date & time', 'Contacts'];

  const quickDates = useMemo(
    () =>
      Array.from({ length: 7 }, (_, index) => {
        const date = addDays(new Date(), index);
        return {
          value: format(date, 'yyyy-MM-dd'),
          label: new Intl.DateTimeFormat(locale === 'ru' ? 'ru-RU' : 'en-US', {
            weekday: 'short',
            day: 'numeric',
            month: 'short',
          }).format(date),
        };
      }),
    [locale],
  );


  const filteredServices = useMemo(() => {
    const query = serviceQuery.trim().toLowerCase();
    if (!query) return profile.services;
    return profile.services.filter((service) => service.toLowerCase().includes(query));
  }, [profile.services, serviceQuery]);

  const labels =
    locale === 'ru'
      ? {
          title: 'Оставить заявку',
          description: 'Выберите услугу, время и оставьте контакты.',
          selectService: 'Выберите услугу',
          serviceTrigger: 'Открыть список услуг',
          serviceSelected: 'Выбрана услуга',
          serviceCount: 'вариантов',
          chooseDate: 'Выберите дату',
          chooseTime: 'Выберите время',
          yourName: 'Имя',
          yourPhone: 'Телефон',
          comment: 'Комментарий',
          commentPlaceholder: 'Например: удобный диапазон времени или пожелания по записи.',
          next: 'Дальше',
          back: 'Назад',
          submit: 'Отправить',
          summary: 'Что будет дальше',
          summaryItems: [
            'Мастер увидит заявку сразу в кабинете.',
            'Выбранные услуга, дата и время сохранятся без переписки.',
            'Подтверждение придёт по указанному номеру.',
          ],
          successTitle: 'Заявка отправлена',
          successDescription: 'Детали сохранены. Мастер увидит заявку и подтвердит время напрямую.',
          selected: 'Выбрано',
          hiddenContact: 'Контакт откроется после подтверждения',
        }
      : {
          title: 'Request a booking',
          description: 'Choose a service, time, and leave your contacts.',
          selectService: 'Choose a service',
          serviceTrigger: 'Open service list',
          serviceSelected: 'Service selected',
          serviceCount: 'options',
          chooseDate: 'Choose a date',
          chooseTime: 'Choose a time',
          yourName: 'Name',
          yourPhone: 'Phone',
          comment: 'Comment',
          commentPlaceholder: 'Any helpful note or preferred time range.',
          next: 'Next',
          back: 'Back',
          submit: 'Send request',
          summary: 'What happens next',
          summaryItems: [
            'The request arrives in the workspace instantly.',
            'The chosen service, date, and time stay attached to the request.',
            'Confirmation is sent to the provided phone number.',
          ],
          successTitle: 'Request sent',
          successDescription: 'Everything is saved. The master sees the request and will confirm it with you.',
          selected: 'Selected',
          hiddenContact: 'This contact is revealed after confirmation',
        };

  const progressValue = ((currentStep + 1) / steps.length) * 100;
  const progressPercent = `${Math.max(12, progressValue)}%`;

  const progressStyle = {
    width: progressPercent,
    background: accent.solid,
  } satisfies CSSProperties;

  const formShellStyle = embedded
    ? undefined
    : {
        background: `linear-gradient(180deg, ${accent.solid}08, rgba(255,255,255,0) 72%)`,
        borderColor: `${accent.solid}18`,
      } satisfies CSSProperties;

  const activeSurfaceStyle = {
    background: `linear-gradient(180deg, ${accent.solid}0b, ${accent.solid}04)`,
    borderColor: `${accent.solid}20`,
  } satisfies CSSProperties;

  const summarySurfaceStyle = {
    background: `linear-gradient(180deg, ${accent.solid}06, rgba(255,255,255,0))`,
    borderColor: `${accent.solid}14`,
  } satisfies CSSProperties;

  const selectedChipStyle = {
    background: `${accent.solid}0a`,
    borderColor: `${accent.solid}18`,
  } satisfies CSSProperties;

  const embeddedPanelClass = 'rounded-[18px] border border-border/78 bg-background/44 p-3.5 backdrop-blur-sm';
  const primaryButtonClass = cn(getPublicButtonClassName(settings.publicButtonStyle, 'primary'), 'min-w-[116px]');
  const ghostButtonClass = getPublicButtonClassName(settings.publicButtonStyle, 'ghost');
  const canMoveForward = () => {
    if (currentStep === 0) return Boolean(values.service);
    if (currentStep === 1) return Boolean(values.date && values.time);
    return Boolean(values.clientName.trim() && values.clientPhone.trim());
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const result = await createBooking(profile.slug, values);

    if (!result.success || !result.booking) {
      setError(result.error || 'Unable to create booking');
      return;
    }

    setError(null);
    setSubmittedBooking(result.booking);
    setValues(initialValues);
    setCurrentStep(0);
  };

  const selectedChips = [
    values.service ? values.service : null,
    values.date ? formatDate(values.date, undefined, locale) : null,
    values.time ? values.time : null,
  ].filter(Boolean) as string[];

  if (submittedBooking) {
    return (
      <div
        className={cn(
          embedded ? 'p-0' : 'rounded-[22px] border border-border/80 bg-card/94 p-5',
        )}
        style={formShellStyle}
      >
        <div className={cn(embedded ? embeddedPanelClass : 'rounded-[20px] border p-5')} style={summarySurfaceStyle}>
          <div className="flex size-11 items-center justify-center rounded-[16px] border border-border/80 bg-background/86">
            <CheckCircle2 className="size-5 text-primary" />
          </div>
          <div className="mt-4 text-[24px] font-semibold tracking-[-0.04em] text-foreground">{labels.successTitle}</div>
          <p className="mt-2 text-[13px] leading-6 text-muted-foreground">{labels.successDescription}</p>

          <div className="mt-5 grid gap-2 sm:grid-cols-2">
            {[
              { label: labels.selectService, value: submittedBooking.service },
              { label: labels.chooseDate, value: formatDate(submittedBooking.date, undefined, locale) },
              { label: labels.chooseTime, value: submittedBooking.time },
              { label: labels.yourName, value: submittedBooking.clientName },
            ].map((item) => (
              <div key={item.label} className="rounded-[16px] border border-border/80 bg-background/88 px-4 py-3">
                <div className="text-[11px] text-muted-foreground">{item.label}</div>
                <div className="mt-1 text-[13px] font-medium text-foreground">{item.value}</div>
              </div>
            ))}
          </div>

          <div className="mt-5 flex justify-end">
            <Button type="button" className={cn(primaryButtonClass, "h-9 px-4 text-[12px]")} onClick={() => setSubmittedBooking(null)}>
              {labels.back}
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <form
      onSubmit={handleSubmit}
      className={cn(
        embedded ? 'bg-transparent p-0' : 'rounded-[22px] border bg-card/94 p-3.5 md:p-4',
      )}
      style={formShellStyle}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="max-w-[220px] space-y-1.5">
          <div className="text-[17px] font-semibold tracking-[-0.04em] text-foreground md:text-[18px]">{labels.title}</div>
          <p className="text-[12px] leading-5 text-muted-foreground">{labels.description}</p>
        </div>

        <div className="rounded-full border border-border/80 bg-background/86 px-2.5 py-1 text-[11px] font-medium text-muted-foreground">
          {currentStep + 1}/{steps.length}
        </div>
      </div>

      <div className="mt-4 h-1 rounded-full bg-border/60">
        <div className="h-full rounded-full transition-all duration-300" style={progressStyle} />
      </div>

      <div className="mt-4 grid grid-cols-3 gap-1.5 rounded-[16px] border border-border/72 bg-background/40 p-1">
        {steps.map((step, index) => (
          <StepLabel key={step} label={step} active={index === currentStep} complete={index < currentStep} />
        ))}
      </div>

      <div className="mt-5 space-y-4">
        {currentStep === 0 ? (
          <section className={cn("space-y-3", embeddedPanelClass)}>
            <div className="flex items-center justify-between gap-3">
              <div className="text-[13px] font-semibold text-foreground">{labels.selectService}</div>
              <span className="rounded-full border border-border/80 bg-background/88 px-2 py-1 text-[10px] text-muted-foreground">
                {profile.services.length} {labels.serviceCount}
              </span>
            </div>

            <Popover
              open={serviceMenuOpen}
              onOpenChange={(open) => {
                setServiceMenuOpen(open);
                if (!open) setServiceQuery('');
              }}
            >
              <PopoverTrigger asChild>
                <button
                  type="button"
                  className={cn(
                    'flex w-full items-center justify-between gap-3 rounded-[14px] border px-3 py-2.5 text-left transition',
                    values.service
                      ? 'text-foreground'
                      : 'border-border/80 bg-background/72 text-muted-foreground hover:border-primary/18 hover:bg-accent/14 hover:text-foreground',
                  )}
                  style={values.service ? activeSurfaceStyle : undefined}
                >
                  <div className="min-w-0">
                    <div className="truncate text-[12px] font-medium text-foreground">
                      {values.service || labels.serviceTrigger}
                    </div>
                    <div className="mt-0.5 text-[10px] text-muted-foreground">
                      {values.service ? labels.serviceSelected : `${profile.services.length} ${labels.serviceCount}`}
                    </div>
                  </div>
                  <span className="flex size-7 shrink-0 items-center justify-center rounded-full border border-border/80 bg-background/84 text-muted-foreground">
                    <ChevronsUpDown className="size-3.5" />
                  </span>
                </button>
              </PopoverTrigger>
              <PopoverContent align="start" className="w-[var(--radix-popover-trigger-width)] rounded-[16px] border border-border/80 p-2">
                <div className="space-y-2">
                  <Input
                    value={serviceQuery}
                    onChange={(event) => setServiceQuery(event.target.value)}
                    placeholder={locale === 'ru' ? 'Поиск услуги' : 'Search service'}
                    className="h-9"
                  />
                  <div className="max-h-[200px] space-y-1 overflow-y-auto pr-1">
                    {filteredServices.map((service) => {
                      const active = values.service === service;

                      return (
                        <button
                          key={service}
                          type="button"
                          onClick={() => {
                            setValues((current) => ({ ...current, service }));
                            setServiceMenuOpen(false);
                            setServiceQuery('');
                          }}
                          className={cn(
                            'flex w-full items-center justify-between gap-3 rounded-[12px] border px-3 py-2 text-left transition',
                            active
                              ? 'text-foreground'
                              : 'border-transparent text-foreground hover:border-border hover:bg-accent/14',
                          )}
                          style={active ? activeSurfaceStyle : undefined}
                        >
                          <span className="truncate text-[12.5px] font-medium">{service}</span>
                          <span
                            className={cn(
                              'flex size-7 shrink-0 items-center justify-center rounded-full border text-[11px] transition',
                              active ? 'border-primary/22 bg-background text-primary' : 'border-border/80 bg-background/84 text-muted-foreground',
                            )}
                          >
                            <ArrowRight className="size-3.5" />
                          </span>
                        </button>
                      );
                    })}
                    {filteredServices.length === 0 ? (
                      <div className="rounded-[14px] border border-dashed border-border/80 px-3 py-3 text-[12px] text-muted-foreground">
                        {locale === 'ru' ? 'Ничего не найдено. Попробуйте другой запрос.' : 'Nothing found. Try another query.'}
                      </div>
                    ) : null}
                  </div>
                </div>
              </PopoverContent>
            </Popover>

            <div className="rounded-[15px] border border-border/72 bg-background/72 px-4 py-3">
              <div className="text-[11px] text-muted-foreground">{labels.selected}</div>
              <div className="mt-2 flex min-h-6 items-center">
                {values.service ? (
                  <span className="rounded-full border px-3 py-1 text-[11px] text-foreground" style={selectedChipStyle}>
                    {values.service}
                  </span>
                ) : (
                  <span className="text-[12px] text-muted-foreground">—</span>
                )}
              </div>
            </div>
          </section>
        ) : null}

        {currentStep === 1 ? (
          <section className={cn("space-y-4", embeddedPanelClass)}>
            <div>
              <div className="mb-3 flex items-center gap-2 text-[13px] font-semibold text-foreground">
                <CalendarDays className="size-4 text-primary" />
                {labels.chooseDate}
              </div>
              <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
                {quickDates.map((date) => (
                  <SelectionChip
                    key={date.value}
                    label={date.label}
                    active={values.date === date.value}
                    onClick={() => setValues((current) => ({ ...current, date: date.value }))}
                    style={activeSurfaceStyle}
                  />
                ))}
              </div>
            </div>

            <div>
              <div className="mb-3 flex items-center gap-2 text-[13px] font-semibold text-foreground">
                <Clock3 className="size-4 text-primary" />
                {labels.chooseTime}
              </div>
              <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
                {timeSlots.map((time) => (
                  <SelectionChip
                    key={time}
                    label={time}
                    compact
                    active={values.time === time}
                    onClick={() => setValues((current) => ({ ...current, time }))}
                    style={activeSurfaceStyle}
                  />
                ))}
              </div>
            </div>
          </section>
        ) : null}

        {currentStep === 2 ? (
          <section className={cn("space-y-3", embeddedPanelClass)}>
            <div className="grid gap-3">
              <div>
                <div className="mb-2 text-[12px] font-medium text-foreground">{labels.yourName}</div>
                <Input
                  value={values.clientName}
                  onChange={(event) => setValues((current) => ({ ...current, clientName: event.target.value }))}
                  placeholder={labels.yourName}
                />
              </div>
              <div>
                <div className="mb-2 text-[12px] font-medium text-foreground">{labels.yourPhone}</div>
                <Input
                  value={values.clientPhone}
                  onChange={(event) => setValues((current) => ({ ...current, clientPhone: event.target.value }))}
                  placeholder="+31 6 1234 5678"
                />
              </div>
            </div>

            <div>
              <div className="mb-2 text-[12px] font-medium text-foreground">{labels.comment}</div>
              <Textarea
                value={values.comment}
                onChange={(event) => setValues((current) => ({ ...current, comment: event.target.value }))}
                placeholder={labels.commentPlaceholder}
                className="min-h-16 resize-none"
              />
            </div>
          </section>
        ) : null}

        {error ? (
          <div className="rounded-[16px] border border-destructive/26 bg-destructive/10 px-4 py-3 text-[12px] text-destructive">
            {error}
          </div>
        ) : null}

        <section className={cn("space-y-3 pt-1", embeddedPanelClass)}>
          <div className="rounded-[16px] border px-3.5 py-3" style={summarySurfaceStyle}>
            <div className="text-[13px] font-semibold text-foreground">{labels.summary}</div>
            <ul className="mt-2.5 space-y-1.5 text-[10.5px] leading-5 text-muted-foreground">
              {labels.summaryItems.map((item) => (
                <li key={item} className="flex gap-2">
                  <span className="mt-[8px] size-1.5 rounded-full bg-primary" />
                  <span>{item}</span>
                </li>
              ))}
            </ul>

            <div className="mt-3 rounded-[14px] border border-border/70 bg-background/88 px-3 py-2.5">
              <div className="text-[11px] text-muted-foreground">{labels.selected}</div>
              <div className="mt-2 flex min-h-6 flex-wrap gap-1.5">
                {selectedChips.length > 0 ? (
                  selectedChips.map((item) => (
                    <span key={item} className="rounded-full border px-2.5 py-1 text-[11px] text-foreground" style={selectedChipStyle}>
                      {item}
                    </span>
                  ))
                ) : (
                  <span className="text-[12px] text-muted-foreground">—</span>
                )}
              </div>
            </div>
          </div>
        </section>

        <div className="flex items-center justify-between gap-2 pt-1">
          <Button
            type="button"
            variant="ghost"
            className={cn(ghostButtonClass, "h-9 px-3 text-[12px]")}
            onClick={() => setCurrentStep((step) => Math.max(0, step - 1))}
            disabled={currentStep === 0}
          >
            <ChevronLeft className="size-4" />
            {labels.back}
          </Button>

          {currentStep < steps.length - 1 ? (
            <Button
              type="button"
              className={cn(primaryButtonClass, "h-9 px-4 text-[12px]")}
              onClick={() => setCurrentStep((step) => Math.min(steps.length - 1, step + 1))}
              disabled={!canMoveForward()}
            >
              {labels.next}
              <ArrowRight className="size-4" />
            </Button>
          ) : (
            <Button type="submit" className={cn(primaryButtonClass, "h-9 px-4 text-[12px]")} disabled={!canMoveForward()}>
              <CheckCircle2 className="size-4" />
              {labels.submit}
            </Button>
          )}
        </div>
      </div>
    </form>
  );
}
