export function cx(...parts: Array<string | false | null | undefined>): string {
  return parts.filter(Boolean).join(' ');
}

export const mpPage = 'min-h-dvh overflow-x-clip bg-canvas';

export const mpHero =
  'border-b border-line bg-white pt-[84px] pb-3 max-md:border-0 max-md:bg-[linear-gradient(180deg,#F6ECFF_0%,#ffffff_72px)] md:pt-[104px] md:pb-[22px]';

export const mpHeroInner =
  'mx-auto mb-3 flex w-full max-w-[1200px] flex-col items-stretch gap-3 px-3.5 md:mb-[18px] md:flex-row md:items-center md:gap-3.5 md:px-6';

export const mpHeroLead = 'flex min-w-0 flex-1 items-center gap-2.5 md:gap-3.5';

export const mpIconBtn =
  'inline-flex size-[42px] shrink-0 items-center justify-center rounded-[13px] border-[1.5px] border-line bg-white text-ink shadow-[0_1px_2px_rgba(16,24,40,0.05)] hover:border-[#D0D5DD] hover:bg-canvas md:size-11 md:rounded-[14px]';

export const mpFilterBtn = `${mpIconBtn} min-[961px]:hidden`;

export const mpHeroCopy = 'min-w-0 flex-1';

export const mpHeroTitle =
  'text-[22px] font-extrabold leading-[1.15] tracking-[-0.04em] text-ink min-[521px]:text-2xl md:text-[28px] md:tracking-[-0.02em]';

export const mpHeroSubtitle = 'mt-0.5 text-[13px] leading-[1.35] text-ink-muted md:mt-0.5 md:text-sm';

export const mpHeroActions =
  'flex w-full shrink-0 items-center gap-2 [&>*]:min-w-0 [&>*]:flex-1 [&>*]:justify-center [&>*]:whitespace-nowrap [&>*]:px-1.5 [&>*]:py-2.5 [&>*]:text-[11px] [&>*]:rounded-xl max-[520px]:[&>*]:px-1.5 max-[520px]:[&>*]:py-[9px] md:inline-flex md:w-auto md:[&>*]:flex-none md:[&>*]:rounded-[14px] md:[&>*]:px-4 md:[&>*]:py-[11px] md:[&>*]:text-sm';

export const mpGhostBtn =
  'inline-flex items-center justify-center gap-1.5 rounded-xl border-[1.5px] border-line bg-white px-3 py-2.5 text-[13px] font-bold text-[#344054] no-underline transition-[border-color,background] duration-150 hover:border-[#D0D5DD] hover:bg-canvas md:rounded-[14px] md:px-4 md:py-[11px] md:text-sm';

export const mpPostBtn =
  'inline-flex shrink-0 items-center justify-center gap-1.5 rounded-xl bg-brand-gradient px-3 py-2.5 text-[13px] font-bold text-white shadow-brand no-underline transition-[opacity,transform] duration-150 hover:opacity-[0.94] hover:-translate-y-px disabled:cursor-not-allowed disabled:opacity-60 disabled:hover:translate-y-0 md:rounded-[14px] md:px-[18px] md:py-[11px] md:text-sm';

export const mpOutlineBtn =
  'inline-flex items-center justify-center rounded-[14px] bg-brand-50 px-[18px] py-[11px] text-sm font-bold text-violet-600 disabled:cursor-not-allowed disabled:opacity-60';

export const mpSoftBtn =
  'inline-flex items-center justify-center rounded-full bg-[#F4EBFF] px-5 py-2.5 text-sm font-bold text-brand-500';

export const mpMoreBtn =
  'rounded-full border-[1.5px] border-brand-500 bg-white px-9 py-3 text-sm font-semibold text-brand-500 disabled:cursor-not-allowed';

export const mpSearchRow =
  'mx-auto mb-2.5 flex w-full max-w-[1200px] items-center gap-2.5 px-3.5 max-md:sticky max-md:top-[72px] max-md:z-40 max-md:mx-0 max-md:mb-2.5 max-md:bg-white max-md:px-3.5 max-md:py-2 md:mb-4 md:px-6';

export const mpSearch =
  'flex h-[46px] min-w-0 flex-1 items-center gap-2.5 rounded-[14px] border-[1.5px] border-line bg-canvas px-4 focus-within:border-brand-500 focus-within:bg-white focus-within:shadow-[0_0_0_4px_rgba(165,74,255,0.12)] md:h-12 md:rounded-2xl';

export const mpSearchInput =
  'min-w-0 flex-1 border-0 bg-transparent text-sm text-ink outline-none placeholder:text-ink-subtle';

export const mpChipsWrap = 'mx-auto w-full max-w-[1200px] px-3.5 pb-0.5 min-[961px]:hidden md:px-6';

export const mpChips =
  'flex gap-2 overflow-x-auto pb-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden';

export const mpChip =
  'inline-flex shrink-0 items-center gap-1.5 rounded-xl border-[1.5px] border-line bg-white px-3 py-[7px] text-xs font-semibold text-[#475467] transition-[background,color,border-color] duration-150 md:rounded-[14px] md:px-3.5 md:py-2 md:text-[13px]';

export const mpChipActive =
  'border-transparent bg-brand-gradient text-white shadow-brand-chip';

export const mpChipSkel = 'h-[38px] w-[108px] shrink-0 rounded-[14px] bg-[#F2F4F7]';

export const mpBody =
  'mx-auto grid w-full max-w-[1200px] grid-cols-1 items-start gap-7 px-3.5 pb-[calc(28px+env(safe-area-inset-bottom,0px))] pt-3.5 min-[961px]:grid-cols-[250px_minmax(0,1fr)] min-[961px]:pt-7 min-[961px]:pb-20 md:px-6 max-md:pt-3.5';

export const mpMineBody =
  'mx-auto w-full max-w-[1200px] px-3.5 pb-[calc(28px+env(safe-area-inset-bottom,0px))] pt-4 md:px-6 md:pt-6 md:pb-16';

export const mpSidebar = 'sticky top-24 hidden flex-col gap-3.5 min-[961px]:flex';

export const mpSidebarCard = 'rounded-[20px] border-[1.5px] border-line bg-white p-4';

export const mpSidebarHead = 'mb-3 flex items-center justify-between gap-2';

export const mpSidebarTitle = 'mb-3 text-sm font-bold text-ink';

export const mpReset = 'bg-transparent p-0 text-[13px] font-semibold text-brand-500';

export const mpSideCats = 'flex flex-col gap-1';

export const mpSideCat =
  'flex w-full items-center gap-2.5 rounded-xl bg-transparent px-2 py-2 text-left text-sm font-medium text-[#344054]';

export const mpSideCatActive = 'bg-brand-50 font-semibold text-[#7F56D9]';

export const mpSideCatIcon =
  'inline-flex size-8 shrink-0 items-center justify-center rounded-[10px] bg-[#F4EBFF]';

export const mpSideCatIconActive = 'bg-brand-gradient';

export const mpSideCatSkel = 'h-12 rounded-xl bg-[#F2F4F7]';

export const mpFilterFields = 'flex flex-col gap-3';

export const mpField = 'flex flex-col gap-1.5 text-[13px] font-semibold text-[#344054]';

export const mpControl =
  'w-full rounded-xl border-[1.5px] border-line bg-white px-3 py-2.5 text-sm font-normal text-ink outline-none focus:border-brand-500 focus:shadow-[0_0_0_4px_rgba(165,74,255,0.12)]';

export const mpTextarea = `${mpControl} min-h-[120px] resize-y`;

export const mpPriceFields = 'grid grid-cols-2 gap-2.5';

export const mpCheck = 'flex items-center gap-2 text-[13px] font-medium text-[#344054]';

export const mpCheckInput = 'size-4 accent-brand-500';

export const mpBanner =
  'relative mb-[18px] flex min-h-0 flex-col items-start justify-between gap-3.5 overflow-hidden rounded-[20px] bg-[linear-gradient(135deg,#C084FC_0%,#A54AFF_48%,#7C3AED_100%)] px-[18px] py-4 md:mb-7 md:min-h-[148px] md:flex-row md:items-center md:gap-5 md:rounded-[22px] md:px-8 md:py-7 max-[960px]:flex-col max-[960px]:items-start max-[960px]:px-5 max-[960px]:py-[22px]';

export const mpBannerCopy = 'relative z-[1] max-w-none md:max-w-[420px]';

export const mpBannerTag =
  'mb-2.5 inline-flex rounded-full bg-[rgba(16,24,40,0.22)] px-2.5 py-1 text-[11px] font-bold tracking-[0.06em] text-white';

export const mpBannerTitle =
  'mb-1 text-xl font-extrabold tracking-tight text-white max-[520px]:text-xl md:mb-1.5 md:text-[26px] max-md:text-[22px]';

export const mpBannerText = 'text-[13px] leading-normal text-white/85 md:text-sm md:leading-normal';

export const mpBannerCta =
  'relative z-[1] inline-flex w-full shrink-0 items-center justify-center rounded-[14px] bg-white px-4 py-3 text-sm font-bold text-violet-600 shadow-[0_8px_20px_rgba(16,24,40,0.12)] hover:bg-brand-50 md:w-auto md:px-[22px]';

export const mpBannerOrb = 'pointer-events-none absolute rounded-full bg-white/12';

export const mpSectionHead = 'mb-3 md:mb-4';

export const mpSectionTitle = 'text-[17px] font-extrabold text-ink md:text-xl';

export const mpSectionCount = 'font-bold text-ink-subtle';

export const mpGrid =
  'grid grid-cols-2 gap-2.5 md:gap-4 min-[961px]:grid-cols-3 min-[1101px]:grid-cols-4';

export const mpCard =
  'flex min-w-0 cursor-pointer flex-col overflow-hidden rounded-2xl border-[1.5px] border-line bg-white transition-[border-color,box-shadow,transform] duration-200 max-md:rounded-2xl md:hover:-translate-y-0.5 md:hover:border-[rgba(165,74,255,0.35)] md:hover:shadow-[0_12px_28px_rgba(165,74,255,0.12)] md:focus-visible:-translate-y-0.5 md:focus-visible:border-[rgba(165,74,255,0.35)] md:focus-visible:shadow-[0_12px_28px_rgba(165,74,255,0.12)] md:focus-visible:outline-none';

export const mpCardMedia =
  'relative aspect-square overflow-hidden bg-[#F2F4F7] md:aspect-auto md:h-[168px]';

export const mpCondition =
  'absolute top-2.5 left-2.5 z-[1] rounded-full bg-[rgba(124,58,237,0.92)] px-[9px] py-1 text-[11px] font-bold text-white';

export const mpHeart =
  'z-[1] inline-flex size-8 items-center justify-center rounded-full bg-white shadow-[0_4px_12px_rgba(16,24,40,0.12)] hover:bg-canvas disabled:cursor-not-allowed disabled:opacity-60';

export const mpHeartOnMedia = `${mpHeart} absolute top-2.5 right-2.5`;

export const mpHeartInline = `${mpHeart} relative`;

export const mpShareIconBtn =
  'relative z-[1] inline-flex size-8 items-center justify-center rounded-full border-[1.5px] border-line bg-canvas text-[#667085] hover:border-[#D0D5DD] hover:bg-white';

export const mpFeatured =
  'absolute bottom-2.5 left-2.5 z-[1] rounded-full bg-yellow-300 px-2 py-1 text-[10px] font-extrabold tracking-wide text-amber-900';

export const mpPhotoCount =
  'absolute right-2.5 bottom-2.5 z-[1] inline-flex items-center gap-1 rounded-full bg-[rgba(16,24,40,0.55)] px-2 py-[3px] text-[11px] font-semibold text-white';

export const mpCardBody = 'flex flex-col gap-1 px-2.5 pt-2.5 pb-3 md:gap-1.5 md:px-3 md:pt-3 md:pb-3.5';

export const mpPriceRow = 'flex min-w-0 items-center gap-2';

export const mpPrice = 'm-0 text-[15px] font-extrabold text-violet-600 md:text-base';

export const mpPriceLg = 'm-0 text-[28px] font-extrabold text-violet-600';

export const mpNeg =
  'rounded-full bg-[#F2F4F7] px-[7px] py-[3px] text-[10px] font-bold text-ink-muted';

export const mpCardTitle =
  'm-0 min-h-[2.8em] overflow-hidden text-[13px] font-semibold leading-snug text-ink line-clamp-2';

export const mpCardCategory = 'm-0 text-[11px] font-semibold text-ink-muted md:text-xs';

export const mpCardViews =
  'mt-0.5 mb-0 inline-flex items-center gap-[5px] text-[11px] font-semibold text-ink-subtle';

export const mpCardActions = 'mt-1 flex flex-wrap gap-1.5';

export const mpCardEdit =
  'self-start rounded-full bg-brand-50 px-2 py-[5px] text-[11px] font-bold text-violet-600 hover:bg-[#F4EBFF] disabled:cursor-not-allowed disabled:opacity-55 disabled:hover:bg-brand-50 md:px-3 md:py-1.5 md:text-xs';

export const mpCardEditDanger =
  'bg-[#FEF3F2] text-[#B42318] hover:bg-[#FEE4E2] disabled:hover:bg-[#FEF3F2]';

export const mpStatus =
  'absolute top-2.5 right-2.5 z-[1] rounded-full px-[9px] py-1 text-[11px] font-bold';

export function mpStatusTone(status: string): string {
  const key = status.trim().toLowerCase();
  if (key === 'sold') return 'bg-[#F2F4F7] text-[#344054]';
  if (key === 'inactive') return 'bg-[#FFFAEB] text-[#B54708]';
  return 'bg-[#ECFDF3] text-[#027A48]';
}

export const mpCardMeta = 'flex items-center justify-between gap-2 text-[11px] text-ink-subtle';

export const mpCardLoc = 'inline-flex min-w-0 items-center gap-1 overflow-hidden text-ellipsis whitespace-nowrap';

export const mpEmpty = 'rounded-[20px] border-[1.5px] border-line bg-white px-6 py-16 text-center';

export const mpEmptyTitle = 'mb-2 text-lg font-bold text-ink';

export const mpEmptyText = 'mb-4 text-sm text-ink-muted';

export const mpSheetBackdrop =
  'fixed inset-0 z-[1200] flex items-end justify-center bg-[rgba(16,24,40,0.45)]';

export const mpSheet =
  'max-h-[86dvh] w-full max-w-[480px] overflow-auto rounded-t-3xl bg-white px-5 pt-3 pb-6';

export const mpSheetBar = 'mx-auto mt-1 mb-3.5 h-1 w-10 rounded-full bg-[#D0D5DD]';

export const mpDetail =
  'mx-auto w-full max-w-[1200px] px-3.5 pt-24 pb-20 md:px-6 md:pt-[112px] md:pb-20';

export const mpDetailBack =
  'mb-[18px] inline-flex items-center gap-1.5 bg-transparent text-[13px] font-semibold text-ink-muted hover:text-brand-500';

export const mpDetailGrid =
  'grid grid-cols-1 items-start gap-7 min-[961px]:grid-cols-[minmax(0,1.15fr)_minmax(280px,0.85fr)]';

export const mpGalleryMain =
  'relative h-[min(58vw,320px)] overflow-hidden rounded-[18px] bg-[#F2F4F7] md:h-[280px] min-[961px]:h-[420px] min-[961px]:rounded-[22px]';

export const mpThumbs = 'mt-2.5 flex gap-2';

export const mpThumb = 'size-[72px] overflow-hidden rounded-xl border-2 border-transparent p-0';

export const mpThumbActive = 'border-brand-500';

export const mpDetailPanel = 'rounded-[22px] border-[1.5px] border-line bg-white p-6';

export const mpDetailTitle = 'mb-2.5 mt-0 text-[22px] font-bold leading-snug text-ink';

export const mpDetailFacts = 'mb-[22px] grid grid-cols-1 gap-2.5 md:grid-cols-3';

export const mpDetailFact = 'rounded-[14px] bg-canvas px-3 py-2.5';

export const mpDetailFactLabel = 'mb-0.5 block text-[11px] text-ink-subtle';

export const mpDetailFactValue = 'text-[13px] font-bold capitalize text-ink';

export const mpDetailH = 'mb-2 mt-0 text-base font-bold text-ink';

export const mpDetailDesc = 'mb-[22px] mt-0 text-sm leading-[1.65] text-[#475467]';

export const mpSellerCard = 'mb-4 flex items-center gap-3 rounded-2xl border-[1.5px] border-line p-3';

export const mpSellerName = 'text-sm font-bold text-ink';

export const mpSellerMeta = 'text-xs text-ink-muted';

export const mpSellerPhone =
  'mt-1 inline-block text-xs font-semibold tabular-nums text-brand-500';

export const mpDetailActions = 'flex flex-col gap-2.5 md:flex-row';

export const mpPost = 'mx-auto w-full max-w-[1200px] px-3.5 pt-24 pb-20 md:px-6 md:pt-[112px] md:pb-20';

export const mpPostTitle = 'mb-1.5 text-[30px] font-extrabold text-ink';

export const mpPostLead = 'mb-6 max-w-[560px] text-[15px] text-ink-muted';

export const mpPostForm =
  'flex max-w-[640px] flex-col gap-3.5 rounded-[22px] border-[1.5px] border-line bg-white p-6';

export const mpPhotoDrop =
  'relative flex flex-col items-center gap-2 rounded-2xl border-[1.5px] border-dashed border-[#D0D5DD] bg-canvas px-4 py-7 text-center';

export const mpPhotoDropActive = 'border-brand-500 bg-[#F9F5FF]';

export const mpPhotoDropTitle = 'text-sm font-bold text-ink';

export const mpPhotoDropHint = 'block max-w-[28rem] text-[13px] text-ink-subtle';

export const mpPhotoUpload =
  'mt-2 inline-flex rounded-full border-[1.5px] border-brand-500 bg-white px-4 py-2 text-[13px] font-semibold text-brand-500';

export const mpPhotoInput = 'sr-only';

export const mpPhotoGrid = 'mt-3 mb-0 flex list-none flex-wrap gap-2.5 p-0';

export const mpPhotoThumb = 'relative h-20 w-[88px] shrink-0 overflow-hidden rounded-[10px] bg-[#F2F4F7]';

export const mpPhotoRemove =
  'absolute top-1 right-1 inline-flex size-[22px] items-center justify-center rounded-full bg-black/65';

export const mpFieldError = 'mt-1 block text-xs font-medium not-italic text-[#D92D20]';

export const mpFieldHint = 'mt-1.5 block text-xs font-normal text-ink-subtle';

export const mpLocationGrid = 'grid grid-cols-1 gap-3 md:grid-cols-[minmax(0,1.2fr)_minmax(0,0.8fr)_minmax(0,0.8fr)]';

export const mpMapWrap = 'overflow-hidden rounded-2xl border-[1.5px] border-line bg-canvas';

export const mpMapSkel = 'flex h-[220px] items-center justify-center text-[13px] text-ink-muted';

export const mpPhoneCard =
  'flex items-center gap-3 rounded-2xl border-[1.5px] border-[#E9D7FE] bg-[#F9F5FF] px-3.5 py-3.5';

export const mpPhoneIcon =
  'inline-flex size-11 shrink-0 items-center justify-center rounded-full bg-[#EEE4FF] text-brand-500';

export const mpPhoneCopy = 'min-w-0 flex-1';

export const mpPhoneNumber = 'm-0 text-[15px] font-bold tabular-nums tracking-tight text-ink';

export const mpPhoneCardHint = 'mt-0.5 m-0 text-[13px] font-normal leading-snug text-ink-muted';

export const mpPhoneBadge =
  'shrink-0 rounded-full border border-[#E9D7FE] bg-white px-2.5 py-1 text-[11px] font-semibold text-brand-500';

export const mpPhoneToggleRow = 'mt-4 flex items-center justify-between gap-4';

export const mpPhoneToggleCopy = 'min-w-0 flex-1';

export const mpPhoneToggleTitle = 'block text-sm font-bold text-ink';

export const mpPhoneToggleHint = 'mt-0.5 block text-[13px] font-normal leading-snug text-ink-muted';

export const mpPhoneSwitch =
  'relative h-7 w-[52px] shrink-0 rounded-full p-0 transition-colors duration-150';

export const mpPhoneSwitchOn = 'bg-brand-500';

export const mpPhoneSwitchOff = 'bg-[#D0D5DD]';

export const mpPhoneSwitchThumb =
  'absolute top-[3px] left-[3px] block size-[22px] rounded-full bg-white shadow-[0_1px_4px_rgba(0,0,0,0.2)] transition-transform duration-150';

export const mpSkelBar = 'rounded bg-[#F2F4F7]';
