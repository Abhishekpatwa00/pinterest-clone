import { Image } from "@imagekit/react";

export const Images = ({
  src,
  w,
  h,
  className,
}: {
  src: string;
  w: number;
  h: number;
  className: string;
}) => {
  if (
    !src ||
    src.startsWith("data:") ||
    src.startsWith("blob:") ||
    (src.startsWith("http") && !src.includes("ik.imagekit.io"))
  ) {
    return (
      <img
        src={src}
        width={w}
        height={h}
        className={className}
        loading="lazy"
        alt=""
      />
    );
  }

  return (
    <Image
      urlEndpoint={import.meta.env.VITE_IMG_ENDPOINT}
      src={src}
      width={w}
      height={h}
      className={className}
      loading="lazy"
      transformation={[
        {
          height: h,
          width: w,
        },
      ]}
      lqip={{ active: true, quality: 20 }}
    />
  );
};