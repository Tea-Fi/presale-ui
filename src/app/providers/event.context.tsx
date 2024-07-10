import { createContext, useContext, useRef, useState } from 'react';
import type { Dispatch, FunctionComponent, ReactNode, SetStateAction } from 'react';
import { EventModal } from '../components/event-modal';

export interface EventContext {
  eventInfo: {
    title: string;
    subTitle: string;
  };
  showModal: () => void;
  hideModal: () => void;
  setEventInfo: Dispatch<SetStateAction<{ title: string; subTitle: string }>>;
}
export const EventContext = createContext<EventContext | null>(null);

export const EventModalProvider: FunctionComponent<{ children: ReactNode }> = ({ children }) => {
  const [eventInfo, setEventInfo] = useState({
    title: '',
    subTitle: '',
  });
  const ref = useRef<any>(null);
  const showModal = () => {
    ref.current?.show();
  };
  const hideModal = () => {
    ref.current?.hide();
  };
  return (
    <EventContext.Provider
      value={{
        showModal,
        hideModal,
        eventInfo,
        setEventInfo,
      }}
    >
      <EventModal
        ref={ref}
        eventInfo={eventInfo}
        hideModal={hideModal}
        setEventInfo={setEventInfo}
        showModal={showModal}
      />
      {children}
    </EventContext.Provider>
  );
};

export const useEventContext = (): EventContext => {
  const contextValue = useContext(EventContext);
  if (!contextValue) {
    throw new Error('Tried to use template context from outside the provider');
  }
  return contextValue;
};
