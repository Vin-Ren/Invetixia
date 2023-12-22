import { useRef, useState, useEffect, useCallback } from 'react';

import { differenceInSeconds } from 'date-fns';

const useTimer = (initialDate: Date) => {
    const timerRef = useRef(0);
    const intervalRef = useRef<any>();

    const [date, setDate] = useState(initialDate)

    const [day, setDay] = useState(0);
    const [hour, setHour] = useState(0);
    const [minute, setMinute] = useState(0);
    const [second, setSecond] = useState(0);

    const updateTimeValues = useCallback((total: number) => {
        const d = Math.floor(total / (3600*24));
        const h = Math.floor(total % (3600*24) / 3600);
        const m = Math.floor(total % 3600 / 60);
        const s = Math.floor(total % 60);

        setDay(d);
        setHour(h);
        setMinute(m);
        setSecond(s);
    }, []);

    const calculateEndTime = useCallback(() => {
        const curDate = new Date(Date.now());
        timerRef.current = differenceInSeconds(date, curDate);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [date]);

    const run = useCallback(() => {
        decreaseNum();
        intervalRef.current = setInterval(decreaseNum, 1000);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const decreaseNum = useCallback(() => {
        if (timerRef.current >= 0) {
            updateTimeValues(timerRef.current);
            timerRef.current = timerRef.current - 1;
        } else {
            clearInterval(intervalRef.current);
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
        }, []);

    useEffect(() => {
        calculateEndTime();
        run();
        return () => clearInterval(intervalRef.current);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [date]);

    return {
        setDate,
        day,
        hour,
        minute,
        second,
    };
};

export default useTimer;
