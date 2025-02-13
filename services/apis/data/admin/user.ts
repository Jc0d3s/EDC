import type { TNullableNumber, TNullableString } from "~/types/common";

export default class User {
    "id": TNullableNumber = null;

    "name": TNullableString = null;

    "roleId": TNullableNumber = null;

    "role": TNullableString = null;

    "orgType": TNullableString = null;

    "isActive": boolean = false;

    "isInternal": boolean = false;

    "firstName": TNullableString = null;

    "lastName": TNullableString = null;

    "username": TNullableString = null;

    "password": TNullableString = null;

    "enterpriseName": TNullableString = null;

    "emailAddress": TNullableString = null;

    "lastLoginTime": TNullableString = null;

    reset(modelRef?: User) {
        this.id = modelRef ? modelRef.id : null;
        this.name = modelRef ? modelRef.name : null;
        this.roleId = modelRef ? modelRef.roleId : null;
        this.role = modelRef ? modelRef.role : null;
        this.orgType = modelRef ? modelRef.orgType : null;
        this.isActive = modelRef ? modelRef.isActive : false;
        this.isInternal = modelRef ? modelRef.isInternal : false;
        this.firstName = modelRef ? modelRef.firstName : null;
        this.lastName = modelRef ? modelRef.lastName : null;
        this.username = modelRef ? modelRef.username : null;
        this.password = modelRef ? modelRef.password : null;
        this.enterpriseName = modelRef ? modelRef.enterpriseName : null;
        this.emailAddress = modelRef ? modelRef.emailAddress : null;
        this.lastLoginTime = modelRef ? modelRef.lastLoginTime : null;
    }
}
