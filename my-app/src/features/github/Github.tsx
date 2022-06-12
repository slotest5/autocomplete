import React, {useEffect, useState} from "react";
import {useAppDispatch, useAppSelector} from "../../app/hooks";
import {clear, fetchReposByQuery, fetchUsersByQuery, selectRepos, selectUsers} from "./githubSlice";
import styles from './Github.module.css';
var _ = require('lodash');

interface GithubProps  {}

const Github: React.FC<GithubProps> = ({}) => {

    const [value,setValue] = useState<string>('');
    const [selected,setSelected] = useState<string>('');
    const [enter,setEnter] = useState<{ enter:boolean,idx:number }>({enter:false,idx:0});
    const [selectedIdx,setSelectedIdx] = useState<number>(-1);
    const [maxLength,setMaxLength] = useState<number>(0);
    const [displayValue,setDisplayValue] = useState<string>('');
    const [fetched,setFetched] = useState<boolean>(false);
    const dispatch = useAppDispatch();
    const usersUnsorted = useAppSelector(selectUsers);
    const reposUnsorted = useAppSelector(selectRepos);

    const users = {...usersUnsorted, list: _.sortBy(usersUnsorted.list, [function(o:any) { return o.login.toLowerCase(); }])}
    const repos = {...reposUnsorted, list: _.sortBy(reposUnsorted.list, [function(o:any) { return o.full_name.toLowerCase(); }])}

useEffect(()=>{
    if(selectedIdx > users.list.length) {
        const idx = selectedIdx - users.list.length;
        const repo = repos?.list?.find((_: any, index: number)=>index === idx);
        setSelected(repo ? repo.html_url : selected);
        setDisplayValue(repo ? repo.full_name : displayValue)
    }
    else {
        const user = users?.list?.find((_: any, index: number)=> index === selectedIdx);
        setSelected(user ? user.html_url : selected);
        setDisplayValue(user ? user.login : displayValue);
    }
},[selectedIdx])

    useEffect(()=>{
        if(selectedIdx > users.list.length) {
            const idx = selectedIdx - users.list.length;
            const url = repos?.list?.find((_: any, index: number)=>index === idx)?.html_url;
            if(url) {
                window.open(url, '_blank');
            }
        }
        else {
            const url = users?.list?.find((_: any, index: number)=> index === selectedIdx)?.html_url;
           if(url) {
               window.open(url, '_blank');
           }
        }
        setEnter({...enter, enter: false})
    },[enter.enter])

    const queryString = '?q=' + value+ '&per_page=50&page=1';
    const debouncedCallback = _.debounce(()=>{
            dispatch(fetchUsersByQuery(queryString));
            dispatch(fetchReposByQuery(queryString))

    }, 1000);

    const handler = (e: { keyCode: any; }) => {
        let idx = selectedIdx;
        let enter = false;
        switch (e.keyCode) {
            case 38: {
                idx = selectedIdx - 1;
                if (idx < 0) {
                    idx = maxLength - 1;
                }
                break;
            }
            case 40: {
                idx = selectedIdx + 1;
                if (idx >= maxLength) {
                    idx = 0
                }
                break;
            }
            case 13: {
                enter = true;
                break;
            }
        }
        setSelectedIdx(idx)
        setEnter({enter, idx})

    }

    useEffect(()=>{
         document.addEventListener('keydown', handler);
        return ()=>{
            document.removeEventListener('keydown',handler)
        }

    },[selectedIdx,maxLength])

    useEffect(()=>{
        setFetched(!users.loading && !repos.loading);
        setSelectedIdx(-1)
    },[users.loading,repos.loading])

    useEffect(()=>{
        setMaxLength(users.list.length + repos.list.length)
    },[users.list.length,repos.list.length])

    useEffect(()=>{
        setFetched(false);
        setSelected('')
        const debounce = debouncedCallback;
if(displayValue && displayValue.length >= 3) {
    debounce();
} else {
    dispatch(clear())
}
        return () => {
            debounce.cancel();
        }
    },[value])

    return <div className={styles.container}>
        <div>Search Github</div>
        <input data-testid={'input-id'} className={styles.input} value={displayValue} onChange={e=>{setValue(e.target.value); setDisplayValue(e.target.value)}}/>
        {users.loading || repos.loading ? <div>Loading...</div> : null}
        {users.error ? <div>{users.error}</div> : null}
        {repos.error ? <div>{repos.error}</div> : null}
        {fetched && displayValue.length > 2 && !users.loading && !repos.loading && !users.error && !repos.error && users.list.length === 0 && repos.list.length === 0 ? <div>No results found</div>: null}
        {(users?.list?.length > 0 || repos?.list?.length > 0) && !users?.loading && !repos.loading && (!users?.error || !repos?.error) ? <div className={styles.list}>
            {users?.list?.length > 0 ? <>
            <div className={styles.category}>Users</div>
           <div className={styles.items}>
            {users?.list?.length > 0 && users.list.map((x:any, index: number)=><div className={`${styles.item} ${selectedIdx === index ? styles.selected : ''}`} onClick={()=>{setSelected(x.html_url); setDisplayValue(x.login)}}>{x.login}</div>)}
        </div>
                </> : null}
            {repos?.list?.length > 0 ? <>
            <div className={styles.category}>Repositories</div>
        <div className={styles.items}>
            {repos?.list?.length > 0 && repos.list.map((x:any, index: number)=><div className={`${styles.item} ${selectedIdx - (users?.list?.length || 0) === index ? styles.selected : ''}`} onClick={()=>{setSelected(x.html_url); setDisplayValue(x.full_name)}}>{x.full_name}</div>)}
        </div>
            </> : null}
       </div> : null}
    </div>
}

export default Github;