import { useEffect } from 'react';

export const useHandleUnreadMessages = (UnHandled_Receiving_Message, onReceive) => {
  useEffect(() => {
    while (UnHandled_Receiving_Message.length) {
      onReceive(UnHandled_Receiving_Message[0]);
      UnHandled_Receiving_Message.shift();
    }
  }, [UnHandled_Receiving_Message, onReceive]);
};
