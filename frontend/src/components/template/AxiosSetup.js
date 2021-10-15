import {useEffect} from 'react';
import {useDispatch} from 'react-redux';
import {setupAxios} from './AxiosSetupActions';

const AxiosSetup = () => {
    const dispatch = useDispatch();

    useEffect(() => {
        dispatch(setupAxios);
    }, [])

    return '';
}

export default AxiosSetup;