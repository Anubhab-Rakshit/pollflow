import { useEffect, useState } from 'react';
import { v4 as uuidv4 } from 'uuid';

export const useFingerprint = () => {
    const [fingerprint, setFingerprint] = useState<string | null>(null);

    useEffect(() => {
        // Check for existing fingerprint in localStorage
        const storedFp = localStorage.getItem('pollflow_voter_id');
        if (storedFp) {
            setFingerprint(storedFp);
        } else {
            // Generate a new one if not found
            const newFp = uuidv4();
            localStorage.setItem('pollflow_voter_id', newFp);
            setFingerprint(newFp);
        }
    }, []);

    return fingerprint;
};
