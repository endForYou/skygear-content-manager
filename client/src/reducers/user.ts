import { Role } from 'skygear';

import { Actions } from '../actions';
import { UserActionTypes } from '../actions/user';
import { initialUserState, UserState } from '../states';
import { SkygearUser } from '../types';
import { update } from '../util';

export default function userReducer(
  state: UserState = initialUserState,
  action: Actions
) {
  switch (action.type) {
    case UserActionTypes.FetchListRequest: {
      return { ...state, page: action.payload.page };
    }
    case UserActionTypes.FetchListSuccess: {
      const { users, overallCount } = action.payload;
      return {
        ...state,
        isLoading: false,
        totalCount: overallCount,
        users,
      };
    }
    case UserActionTypes.FetchListFailure: {
      return { ...state, isLoading: false, error: action.payload.error };
    }
    case UserActionTypes.UpdateUserCMSAccessRequest: {
      const users = state.users;
      const { id } = action.payload;
      return {
        ...state,
        users: update<SkygearUser>(
          users,
          user => {
            user.isRolesUpdating = true;
            return user;
          },
          user => user.id === id
        ),
      };
    }
    case UserActionTypes.UpdateUserCMSAccessSuccess: {
      const users = state.users;
      const { adminRole, hasAccess, id } = action.payload;
      return {
        ...state,
        users: update<SkygearUser>(
          users,
          user => {
            user.isRolesUpdating = false;
            if (hasAccess) {
              user.roles =
                user.roles.filter(r => r.name === adminRole).length > 0
                  ? user.roles
                  : [...user.roles, new Role(adminRole)];
            } else {
              user.roles = user.roles.filter(r => r.name !== adminRole);
            }
            return user;
          },
          user => user.id === id
        ),
      };
    }
    case UserActionTypes.UpdateUserCMSAccessFailure: {
      const users = state.users;
      const { id } = action.payload;
      // TODO (Steven-Chan):
      // display error
      return {
        ...state,
        users: update<SkygearUser>(
          users,
          user => {
            user.isRolesUpdating = false;
            return user;
          },
          user => user.id === id
        ),
      };
    }
    default:
      return state;
  }
}
