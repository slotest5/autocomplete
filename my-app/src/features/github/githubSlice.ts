import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import { RootState } from '../../app/store';
import {get} from './githubAPI';

const searchURL = 'https://api.github.com/search/';

interface Users {
    list: any;
    loading: boolean;
    error?: string;
}

interface Repos {
    list: any;
    loading: boolean;
    error?: string;
}

export interface CounterState {
    users: Users;
    repositories: Repos;
}

const initialState: CounterState = {
    users: {
        loading: false,
        list: [],
        error: '',
    },
    repositories: {
        loading: false,
        list: [],
        error: '',
    },
};

export const fetchAsync = createAsyncThunk(
    'counter/get',
    async (url: string) => {
        const response = await get(url);
        return response;
    }
);

export const fetchUsersByQuery = createAsyncThunk(
    'github/fetchUsersByQuery',
    async (query: string) => {
        const response = await get(searchURL+'users'+query);
        return response;
    }
);

export const fetchReposByQuery = createAsyncThunk(
    'github/fetchReposByQuery',
    async (query: string) => {
        const response = await get(searchURL+'repositories'+query);
        return response;
    }
);

export const githubSlice = createSlice({
    name: 'github',
    initialState,
    reducers: {
        clear: (state) => {
      state.users = {
            list: [],
            error: '',
            loading: false
        };
      state.repositories = {
            list: [],
            error: '',
            loading: false
        }
        return state
},
    },
    extraReducers: (builder) => {
        builder
            .addCase(fetchUsersByQuery.pending, (state) => {
                state.users.loading = true;
                state.users.error = '';
            })
            .addCase(fetchUsersByQuery.fulfilled, (state, action) => {
                state.users.loading = false;
                state.users.error = '';
                // @ts-ignore
                state.users.list = action.payload?.items;
            })
            .addCase(fetchUsersByQuery.rejected, (state) => {
                state.users.loading = false;
                state.users.error = 'Fetch users error';
            })

            .addCase(fetchReposByQuery.pending, (state) => {
                state.repositories.loading = true;
                state.repositories.error = '';
            })
            .addCase(fetchReposByQuery.fulfilled, (state, action) => {
                state.repositories.loading = false;
                state.repositories.error = '';
                // @ts-ignore
                state.repositories.list = action.payload?.items;
            })
            .addCase(fetchReposByQuery.rejected, (state) => {
                state.repositories.loading = false;
                state.repositories.error = 'Fetch repositories error';
            })
        }
});

export const { clear } = githubSlice.actions;

export const selectUsers = (state: RootState) => state.github.users;
export const selectRepos = (state: RootState) => state.github.repositories;

export default githubSlice.reducer;
