import { forwardRef } from 'react';
import { SlButton, SlDialog } from '@shoelace-style/shoelace/dist/react';
import { EventContext } from '../context/event.context';

export const EventModal = forwardRef(({ eventInfo, hideModal }: EventContext, ref: any) => {
  return (
    <SlDialog ref={ref} className="event-modal" label="Attention!">
      <div className="event-modal__info">
        <h3 className="event-modal__title">{eventInfo.title}</h3>
        {eventInfo.subTitle && <p className="event-modal__sub-title">{eventInfo.subTitle}</p>}
      </div>
      <SlButton className="event-modal__close-btn" slot="footer" variant="primary" onClick={hideModal}>
        Close
      </SlButton>
    </SlDialog>
  );
});
