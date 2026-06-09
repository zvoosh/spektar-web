import { Helmet } from "react-helmet-async";

const SITE_NAME = "Spektar Beograda";
const DEFAULT_DESC = "Mesto za povezivanje, deljenje preporuka, događaja i priča iz Beograda.";
const DEFAULT_IMAGE = "/og-image.jpg";
const SITE_URL = import.meta.env.VITE_APP_URL ?? "https://spektar.rs";

interface Props {
  title?: string;
  description?: string;
  image?: string;
  /** Canonical URL path, e.g. "/c/muzika" */
  path?: string;
  /** "website" | "article" — defaults to "website" */
  type?: "website" | "article";
}

const PageMeta = ({
  title,
  description = DEFAULT_DESC,
  image = DEFAULT_IMAGE,
  path = "",
  type = "website",
}: Props) => {
  const fullTitle = title ? `${title} · ${SITE_NAME}` : SITE_NAME;
  const canonicalUrl = `${SITE_URL}${path}`;
  const ogImage = image.startsWith("http") ? image : `${SITE_URL}${image}`;

  return (
    <Helmet>
      {/* Primary */}
      <title>{fullTitle}</title>
      <meta name="description" content={description} />
      <link rel="canonical" href={canonicalUrl} />

      {/* Open Graph */}
      <meta property="og:site_name" content={SITE_NAME} />
      <meta property="og:title" content={fullTitle} />
      <meta property="og:description" content={description} />
      <meta property="og:image" content={ogImage} />
      <meta property="og:url" content={canonicalUrl} />
      <meta property="og:type" content={type} />

      {/* Twitter Card */}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={fullTitle} />
      <meta name="twitter:description" content={description} />
      <meta name="twitter:image" content={ogImage} />
    </Helmet>
  );
};

export default PageMeta;
