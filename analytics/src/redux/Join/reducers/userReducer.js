/* eslint-disable */
import {
    GET_USERS_REQUEST,
    GET_USERS_SUCCESS,
    GET_USERS_FAILED,
    REGISTER_USER_REQUEST,
    REGISTER_USER_FAILED,
    REGISTER_USER_SUCCESS,
    SHOW_EDIT_DIALOG,
    HIDE_EDIT_DIALOG,
    EDIT_USER_REQUEST,
    EDIT_USER_SUCCESS,
    EDIT_USER_FAILED,
    SHOW_DELETE_DIALOG,
    HIDE_DELETE_DIALOG,
    DELETE_USER_REQUEST,
    DELETE_USER_SUCCESS,
    DELETE_USER_FAILED,
    TOGGLE_REGISTER_USER,
    HIDE_CONFIRM_DIALOG,
    CONFIRM_USER_REQUEST,
    CONFIRM_USER_SUCCESS,
    CONFIRM_USER_FAILED,
    SHOW_CONFIRM_DIALOG,
    SET_DEFAULTS_REQUEST,
    SET_DEFAULTS_SUCCESS,
    SET_DEFAULTS_FAILED
} from "../types";

const isEmpty = require("is-empty");

const initialState = {
    users: [],
    collaborators: [],
    user: null,
    isFetching: false,
    error: null,
    successMsg: null,
    showDeleteDialog: false,
    userToDelete: null,
    showEditDialog: false,
    userToEdit: null,
    newUser: null,
    showAddUser: false,
    userToConfirm: null,
    showConfirmDialog: null,
    userToDefault: null,
    userDefaults: {},
    showAddUser: false,
};

export default function(state = initialState, action) {
    switch (action.type) {
        /************************* fetch users ****************************************** */
        case GET_USERS_REQUEST:
            return {
                ...state,
                users: [],
                user: null,
                isFetching: true,
                error: null,
                successMsg: null,
                showDeleteDialog: false,
                userToDelete: null,
                showEditDialog: false,
                userToEdit: null
            };
        case GET_USERS_SUCCESS:
            return {
                ...state,
                users: action.users,
                user: null,
                isFetching: false,
                error: null,
                successMsg: action.message,
                showDeleteDialog: false,
                userToDelete: null,
                showEditDialog: false,
                userToEdit: null
            };
        case GET_USERS_FAILED:
            return {
                ...state,
                users: [],
                user: null,
                isFetching: false,
                error: action.error,
                successMsg: null,
                showDeleteDialog: false,
                userToDelete: null,
                showEditDialog: false,
                userToEdit: null
            };
            /************************* Add/register user ****************************************** */
        case REGISTER_USER_REQUEST:
            return {
                ...state,
                users: state.users,
                user: null,
                isFetching: true,
                error: null,
                successMsg: null,
                showDeleteDialog: false,
                userToDelete: null,
                showEditDialog: false,
                userToEdit: null,
                newUser: action.user,

            };
        case REGISTER_USER_FAILED:
            return {
                ...state,
                users: state.users,
                user: null,
                isFetching: true,
                error: action.error,
                successMsg: null,
                showDeleteDialog: false,
                userToDelete: null,
                showEditDialog: false,
                userToEdit: null,
                newUser: null
            };
        case REGISTER_USER_SUCCESS:
            return {
                ...state,
                users: [...state.users, action.payload.user],
                user: null,
                isFetching: false,
                error: null,
                successMsg: action.message,
                showDeleteDialog: false,
                userToDelete: null,
                showEditDialog: false,
                userToEdit: null,
                newUser: action.user
            };
            /************************* edit user ****************************************** */
        case SHOW_EDIT_DIALOG:
            return {
                ...state,
                users: state.users,
                user: null,
                isFetching: false,
                error: null,
                successMsg: null,
                showDeleteDialog: false,
                userToDelete: null,
                showEditDialog: true,
                userToEdit: action.user,
                newUser: null
            };

        case HIDE_EDIT_DIALOG:
            return {
                ...state,
                users: state.users,
                user: null,
                isFetching: false,
                error: null,
                successMsg: null,
                showDeleteDialog: false,
                userToDelete: null,
                showEditDialog: false,
                userToEdit: null,
                newUser: null
            };
        case EDIT_USER_REQUEST:
            return {
                ...state,
                users: state.users,
                user: null,
                isFetching: false,
                error: null,
                successMsg: null,
                showDeleteDialog: false,
                userToDelete: null,
                showEditDialog: true,
                userToEdit: action.userToEdit,
                newUser: null
            };

        case EDIT_USER_SUCCESS:
            const updatedUsers = state.users.map(user => {
                if (user._id !== action.userToEdit._id) {
                    //this is not the item of interest
                    return user;
                }
                //this is the one whose updated value we want...
                return {...user, ...action.userToEdit };
            });
            return {
                ...state,
                users: updatedUsers,
                user: null,
                isFetching: false,
                error: null,
                successMsg: action.message,
                showDeleteDialog: false,
                userToDelete: null,
                showEditDialog: true,
                userToEdit: action.userToEdit,
                newUser: null
            };

        case EDIT_USER_FAILED:
            return {
                ...state,
                users: state.users,
                user: null,
                isFetching: false,
                error: action.error,
                successMsg: null,
                showDeleteDialog: false,
                userToDelete: null,
                showEditDialog: true,
                userToEdit: action.userToEdit,
                newUser: null
            };
            /************************* delete user ****************************************** */
        case SHOW_DELETE_DIALOG:
            return {
                ...state,
                users: state.users,
                user: null,
                isFetching: false,
                error: action.error,
                successMsg: null,
                showDeleteDialog: true,
                userToDelete: action.user,
                showEditDialog: false,
                userToEdit: null,
                newUser: null
            };

        case HIDE_DELETE_DIALOG:
            return {
                ...state,
                users: state.users,
                user: null,
                isFetching: false,
                error: action.error,
                successMsg: null,
                showDeleteDialog: false,
                userToDelete: null,
                showEditDialog: false,
                userToEdit: null,
                newUser: null
            };

        case DELETE_USER_REQUEST:
            return {
                ...state,
                users: state.users,
                user: null,
                isFetching: false,
                error: null,
                successMsg: null,
                showDeleteDialog: true,
                userToDelete: action.userToDelete,
                showEditDialog: false,
                userToEdit: null,
                newUser: null
            };

        case DELETE_USER_SUCCESS:
            const filteredUsers = state.users.filter(
                user => user._id !== state.userToDelete._id
            );
            return {
                ...state,
                users: filteredUsers,
                user: null,
                isFetching: false,
                error: null,
                successMsg: action.message,
                showDeleteDialog: false,
                userToDelete: action.userToDelete,
                showEditDialog: false,
                userToEdit: null,
                newUser: null
            };

        case DELETE_USER_FAILED:
            return {
                ...state,
                users: state.users,
                user: null,
                isFetching: false,
                error: action.error,
                successMsg: null,
                showDeleteDialog: true,
                userToDelete: action.userToDelete,
                showEditDialog: false,
                userToEdit: null,
                newUser: null
            };
        case TOGGLE_REGISTER_USER:
            return {
                ...state,
                showAddUser: !state.showAddUser
            };

            /************************* confirm user ****************************************** */
        case SHOW_CONFIRM_DIALOG:
            return {
                ...state,
                users: state.users,
                user: null,
                isFetching: false,
                error: action.error,
                successMsg: null,
                showDeleteDialog: false,
                userToDelete: action.user,
                showEditDialog: false,
                userToEdit: null,
                newUser: null
            }
        case HIDE_CONFIRM_DIALOG:
            return {
                ...state,
                users: state.users,
                user: null,
                isFetching: false,
                error: action.error,
                successMsg: null,
                showDeleteDialog: false,
                userToDelete: null,
                showEditDialog: false,
                userToEdit: null,
                newUser: null
            }
        case CONFIRM_USER_REQUEST:
            return {
                ...state,
                users: state.users,
                user: null,
                isFetching: false,
                error: null,
                successMsg: null,
                showDeleteDialog: true,
                userToDelete: action.userToConfirm,
                showEditDialog: false,
                userToEdit: null,
                newUser: null
            }
        case CONFIRM_USER_SUCCESS:
            return {
                ...state,
                users: state.users,
                user: null,
                isFetching: false,
                error: null,
                successMsg: action.message,
                showDeleteDialog: true,
                userToDelete: action.userToConfirm,
                showEditDialog: false,
                userToEdit: null,
                newUser: null
            }
        case CONFIRM_USER_FAILED:
            return {
                ...state,
                users: state.users,
                user: null,
                isFetching: false,
                error: action.error,
                successMsg: null,
                showDeleteDialog: true,
                userToDelete: action.userToConfirm,
                showEditDialog: false,
                userToEdit: null,
                newUser: null
            }

            //set defaults
        case SET_DEFAULTS_REQUEST:
            return {
                ...state,
                userToDefault: action.userToDefault,
                userDefaults: false,
            }
        case SET_DEFAULTS_SUCCESS:
            return {
                ...state,
                users: state.users,
                user: null,
                isFetching: false,
                error: null,
                successMsg: action.message,
                showDeleteDialog: true,
                userToDelete: action.userToConfirm,
                showEditDialog: false,
                userToEdit: null,
                newUser: null
            }
        case SET_DEFAULTS_FAILED:
            return {
                ...state,
                users: state.users,
                user: null,
                isFetching: false,
                error: action.error,
                successMsg: null,
                showDeleteDialog: true,
                userToDelete: action.userToConfirm,
                showEditDialog: false,
                userToEdit: null,
                newUser: null
            }

        default:
            return state;
    }
}