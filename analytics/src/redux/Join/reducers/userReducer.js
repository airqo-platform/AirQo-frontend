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
    CONFIRM_USER_FAILED
} from "../types";

const isEmpty = require("is-empty");

const initialState = {
    actors: [],
    actor: null,
    isFetching: false,
    error: null,
    successMsg: null,
    showDeleteDialog: false,
    actorToDelete: null,
    showEditDialog: false,
    actorToEdit: null,
    newActor: null,
    showAddActor: false
};

export default function(state = initialState, action) {
    switch (action.type) {
        case GET_USERS_REQUEST:
            return {
                ...state,
                actors: [],
                actor: null,
                isFetching: true,
                error: null,
                successMsg: null,
                showDeleteDialog: false,
                actorToDelete: null,
                showEditDialog: false,
                actorToEdit: null
            };
        case GET_USERS_SUCCESS:
            return {
                ...state,
                actors: action.users,
                actor: null,
                isFetching: false,
                error: null,
                successMsg: action.message,
                showDeleteDialog: false,
                actorToDelete: null,
                showEditDialog: false,
                actorToEdit: null
            };
        case GET_USERS_FAILED:
            return {
                ...state,
                actors: [],
                actor: null,
                isFetching: false,
                error: action.error,
                successMsg: null,
                showDeleteDialog: false,
                actorToDelete: null,
                showEditDialog: false,
                actorToEdit: null
            };
        case REGISTER_USER_REQUEST:
            return {
                ...state,
                actors: state.actors,
                actor: null,
                isFetching: true,
                error: null,
                successMsg: null,
                showDeleteDialog: false,
                actorToDelete: null,
                showEditDialog: false,
                actorToEdit: null,
                newActor: action.user
            };
        case REGISTER_USER_FAILED:
            return {
                ...state,
                actors: state.actors,
                actor: null,
                isFetching: true,
                error: action.error,
                successMsg: null,
                showDeleteDialog: false,
                actorToDelete: null,
                showEditDialog: false,
                actorToEdit: null,
                newActor: null
            };
        case REGISTER_USER_SUCCESS:
            return {
                ...state,
                actors: [...state.actors, action.payload.user],
                actor: null,
                isFetching: false,
                error: null,
                successMsg: action.message,
                showDeleteDialog: false,
                actorToDelete: null,
                showEditDialog: false,
                actorToEdit: null,
                newActor: action.user
            };
        case SHOW_EDIT_DIALOG:
            return {
                ...state,
                actors: state.actors,
                actor: null,
                isFetching: false,
                error: null,
                successMsg: null,
                showDeleteDialog: false,
                actorToDelete: null,
                showEditDialog: true,
                actorToEdit: action.user,
                newActor: null
            };

        case HIDE_EDIT_DIALOG:
            return {
                ...state,
                actors: state.actors,
                actor: null,
                isFetching: false,
                error: null,
                successMsg: null,
                showDeleteDialog: false,
                actorToDelete: null,
                showEditDialog: false,
                actorToEdit: null,
                newActor: null
            };
        case EDIT_USER_REQUEST:
            return {
                ...state,
                actors: state.actors,
                actor: null,
                isFetching: false,
                error: null,
                successMsg: null,
                showDeleteDialog: false,
                actorToDelete: null,
                showEditDialog: true,
                actorToEdit: action.userToEdit,
                newActor: null
            };

        case EDIT_USER_SUCCESS:
            const updatedActors = state.actors.map(actor => {
                if (actor._id !== action.payload.userToEdit._id) {
                    //this is not the item of interest
                    return actor;
                }
                //this is the one whose updated value we want...
                return {...actor, ...action.userToEdit };
            });
            return {
                ...state,
                actors: updatedActors,
                actor: null,
                isFetching: false,
                error: null,
                successMsg: action.message,
                showDeleteDialog: false,
                actorToDelete: null,
                showEditDialog: true,
                actorToEdit: action.userToEdit,
                newActor: null
            };

        case EDIT_USER_FAILED:
            return {
                ...state,
                actors: state.actors,
                actor: null,
                isFetching: false,
                error: action.error,
                successMsg: null,
                showDeleteDialog: false,
                actorToDelete: null,
                showEditDialog: true,
                actorToEdit: action.userToEdit,
                newActor: null
            };
        case SHOW_DELETE_DIALOG:
            return {
                ...state,
                actors: state.actors,
                actor: null,
                isFetching: false,
                error: action.error,
                successMsg: null,
                showDeleteDialog: true,
                actorToDelete: action.user,
                showEditDialog: false,
                actorToEdit: null,
                newActor: null
            };

        case HIDE_DELETE_DIALOG:
            return {
                ...state,
                actors: state.actors,
                actor: null,
                isFetching: false,
                error: action.error,
                successMsg: null,
                showDeleteDialog: false,
                actorToDelete: null,
                showEditDialog: false,
                actorToEdit: null,
                newActor: null
            };

        case DELETE_USER_REQUEST:
            return {
                ...state,
                actors: state.actors,
                actor: null,
                isFetching: false,
                error: null,
                successMsg: null,
                showDeleteDialog: true,
                actorToDelete: action.userToDelete,
                showEditDialog: false,
                actorToEdit: null,
                newActor: null
            };

        case DELETE_USER_SUCCESS:
            const filteredActors = state.actors.filter(
                actor => actor._id !== state.userToDelete._id
            );
            return {
                ...state,
                actors: filteredActors,
                actor: null,
                isFetching: false,
                error: null,
                successMsg: action.message,
                showDeleteDialog: false,
                actorToDelete: action.userToDelete,
                showEditDialog: false,
                actorToEdit: null,
                newActor: null
            };

        case DELETE_USER_FAILED:
            return {
                ...state,
                actors: state.actors,
                actor: null,
                isFetching: false,
                error: action.error,
                successMsg: null,
                showDeleteDialog: true,
                actorToDelete: action.userToDelete,
                showEditDialog: false,
                actorToEdit: null,
                newActor: null
            };
        case TOGGLE_REGISTER_USER:
            return {
                ...state,
                showAddActor: !state.showAddActor
            };

            //confirm
        case SHOW_CONFIRM_DIALOG:
            return {
                ...currentState,
                products: currentState.products,
                product: null,
                isFetching: false,
                error: action.error,
                successMsg: null,
                showDeleteModal: true,
                productToDelete: action.product,
                showEditModal: false,
                productToEdit: null,
                newTodo: null
            }
        case HIDE_CONFIRM_DIALOG:
            return {
                ...currentState,
                products: currentState.products,
                product: null,
                isFetching: false,
                error: action.error,
                successMsg: null,
                showDeleteModal: false,
                productToDelete: null,
                showEditModal: false,
                productToEdit: null,
                newTodo: null
            }
        case CONFIRM_USER_REQUEST:
            return {
                ...currentState,
                products: currentState.products,
                product: null,
                isFetching: false,
                error: null,
                successMsg: null,
                showDeleteModal: true,
                productToDelete: action.productToConfirm,
                showEditModal: false,
                productToEdit: null,
                newTodo: null
            }
        case CONFIRM_USER_SUCCESS:
            return {
                ...currentState,
                products: currentState.products,
                product: null,
                isFetching: false,
                error: null,
                successMsg: action.message,
                showDeleteModal: true,
                productToDelete: action.productToConfirm,
                showEditModal: false,
                productToEdit: null,
                newTodo: null
            }
        case CONFIRM_USER_FAILED:
            return {
                ...currentState,
                products: currentState.products,
                product: null,
                isFetching: false,
                error: action.error,
                successMsg: null,
                showDeleteModal: true,
                productToDelete: action.productToConfirm,
                showEditModal: false,
                productToEdit: null,
                newTodo: null
            }




        default:
            return state;
    }
}