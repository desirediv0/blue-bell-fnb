const AnnouncementBanner = () => {
  return (
    <div className="bg-primary/10 py-2 md:py-4 overflow-hidden">
      <div className="container mx-auto px-4">
        <div className="flex flex-wrap items-center justify-center gap-4 md:gap-8 text-center">
          <div className="flex items-center">
            <span className="text-xs md:text-base font-medium">
              ⚡ Spend ₹999 or more and unlock a scratch card – win exciting
              goodies!
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AnnouncementBanner;