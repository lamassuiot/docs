import { asset } from "@/lib/asset";

export function CACreationAnimation({
  locale,
  title,
}: {
  locale: "en" | "es";
  title: string;
}) {
  return (
    <iframe
      src={`${asset("demos/ca-creation/ca-creation-animation.html")}?lang=${locale}`}
      title={title}
      loading="lazy"
      allow="fullscreen"
      allowFullScreen
      className="my-6 h-[min(900px,85vh)] min-h-[620px] w-full rounded-lg border border-fd-border bg-white"
    />
  );
}