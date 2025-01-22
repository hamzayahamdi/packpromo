import { track } from '@vercel/analytics';

type UTMParams = {
  source: string;
  medium: string;
  campaign: string;
  content?: string;
  term?: string;
}

interface AnalyticsEventData {
  page?: string;
  referrer?: string;
  productId?: string;
  productName?: string;
  productPrice?: number;
  category?: string;
  [key: string]: string | number | undefined; // For any additional properties
}

export const trackWithUTM = (
  eventName: string, 
  data: AnalyticsEventData, 
  utmParams: UTMParams
) => {
  try {
    const eventData = {
      ...data,
      utm_source: utmParams.source,
      utm_medium: utmParams.medium,
      utm_campaign: utmParams.campaign,
      ...(utmParams.content && { utm_content: utmParams.content }),
      ...(utmParams.term && { utm_term: utmParams.term }),
    };

    track(eventName, eventData);
  } catch (error) {
    console.error('Analytics tracking error:', error);
  }
}; 