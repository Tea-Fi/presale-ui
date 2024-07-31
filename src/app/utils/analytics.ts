type WindowWithDataLayer = Window & {
  gtag: Function;
}

declare const window: WindowWithDataLayer;

type TrackerProps = {
  eventName: string;
  parameters?: Record<string, any>;
}

export const track = ({ eventName, parameters }: TrackerProps) => {
  window.gtag('event', eventName, parameters);
}
