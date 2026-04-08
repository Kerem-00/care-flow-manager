import type { QueryKey, UseMutationOptions, UseMutationResult, UseQueryOptions, UseQueryResult } from "@tanstack/react-query";
import type { ActivityItem, AuthResponse, Booking, CreateBookingRequest, ErrorResponse, GetBookingsParams, HealthStatus, LoginRequest, MessageResponse, RegisterRequest, RejectBookingRequest, StaffStats, User, VisitorStats } from "./api.schemas";
import { customFetch } from "../custom-fetch";
import type { ErrorType, BodyType } from "../custom-fetch";
type AwaitedInput<T> = PromiseLike<T> | T;
type Awaited<O> = O extends AwaitedInput<infer T> ? T : never;
type SecondParameter<T extends (...args: never) => unknown> = Parameters<T>[1];
/**
 * Returns server health status
 * @summary Health check
 */
export declare const getHealthCheckUrl: () => string;
export declare const healthCheck: (options?: RequestInit) => Promise<HealthStatus>;
export declare const getHealthCheckQueryKey: () => readonly ["/api/healthz"];
export declare const getHealthCheckQueryOptions: <TData = Awaited<ReturnType<typeof healthCheck>>, TError = ErrorType<unknown>>(options?: {
    query?: UseQueryOptions<Awaited<ReturnType<typeof healthCheck>>, TError, TData>;
    request?: SecondParameter<typeof customFetch>;
}) => UseQueryOptions<Awaited<ReturnType<typeof healthCheck>>, TError, TData> & {
    queryKey: QueryKey;
};
export type HealthCheckQueryResult = NonNullable<Awaited<ReturnType<typeof healthCheck>>>;
export type HealthCheckQueryError = ErrorType<unknown>;
/**
 * @summary Health check
 */
export declare function useHealthCheck<TData = Awaited<ReturnType<typeof healthCheck>>, TError = ErrorType<unknown>>(options?: {
    query?: UseQueryOptions<Awaited<ReturnType<typeof healthCheck>>, TError, TData>;
    request?: SecondParameter<typeof customFetch>;
}): UseQueryResult<TData, TError> & {
    queryKey: QueryKey;
};
/**
 * @summary Register a new user
 */
export declare const getRegisterUrl: () => string;
export declare const register: (registerRequest: RegisterRequest, options?: RequestInit) => Promise<AuthResponse>;
export declare const getRegisterMutationOptions: <TError = ErrorType<ErrorResponse>, TContext = unknown>(options?: {
    mutation?: UseMutationOptions<Awaited<ReturnType<typeof register>>, TError, {
        data: BodyType<RegisterRequest>;
    }, TContext>;
    request?: SecondParameter<typeof customFetch>;
}) => UseMutationOptions<Awaited<ReturnType<typeof register>>, TError, {
    data: BodyType<RegisterRequest>;
}, TContext>;
export type RegisterMutationResult = NonNullable<Awaited<ReturnType<typeof register>>>;
export type RegisterMutationBody = BodyType<RegisterRequest>;
export type RegisterMutationError = ErrorType<ErrorResponse>;
/**
 * @summary Register a new user
 */
export declare const useRegister: <TError = ErrorType<ErrorResponse>, TContext = unknown>(options?: {
    mutation?: UseMutationOptions<Awaited<ReturnType<typeof register>>, TError, {
        data: BodyType<RegisterRequest>;
    }, TContext>;
    request?: SecondParameter<typeof customFetch>;
}) => UseMutationResult<Awaited<ReturnType<typeof register>>, TError, {
    data: BodyType<RegisterRequest>;
}, TContext>;
/**
 * @summary Login
 */
export declare const getLoginUrl: () => string;
export declare const login: (loginRequest: LoginRequest, options?: RequestInit) => Promise<AuthResponse>;
export declare const getLoginMutationOptions: <TError = ErrorType<ErrorResponse>, TContext = unknown>(options?: {
    mutation?: UseMutationOptions<Awaited<ReturnType<typeof login>>, TError, {
        data: BodyType<LoginRequest>;
    }, TContext>;
    request?: SecondParameter<typeof customFetch>;
}) => UseMutationOptions<Awaited<ReturnType<typeof login>>, TError, {
    data: BodyType<LoginRequest>;
}, TContext>;
export type LoginMutationResult = NonNullable<Awaited<ReturnType<typeof login>>>;
export type LoginMutationBody = BodyType<LoginRequest>;
export type LoginMutationError = ErrorType<ErrorResponse>;
/**
 * @summary Login
 */
export declare const useLogin: <TError = ErrorType<ErrorResponse>, TContext = unknown>(options?: {
    mutation?: UseMutationOptions<Awaited<ReturnType<typeof login>>, TError, {
        data: BodyType<LoginRequest>;
    }, TContext>;
    request?: SecondParameter<typeof customFetch>;
}) => UseMutationResult<Awaited<ReturnType<typeof login>>, TError, {
    data: BodyType<LoginRequest>;
}, TContext>;
/**
 * @summary Logout
 */
export declare const getLogoutUrl: () => string;
export declare const logout: (options?: RequestInit) => Promise<MessageResponse>;
export declare const getLogoutMutationOptions: <TError = ErrorType<unknown>, TContext = unknown>(options?: {
    mutation?: UseMutationOptions<Awaited<ReturnType<typeof logout>>, TError, void, TContext>;
    request?: SecondParameter<typeof customFetch>;
}) => UseMutationOptions<Awaited<ReturnType<typeof logout>>, TError, void, TContext>;
export type LogoutMutationResult = NonNullable<Awaited<ReturnType<typeof logout>>>;
export type LogoutMutationError = ErrorType<unknown>;
/**
 * @summary Logout
 */
export declare const useLogout: <TError = ErrorType<unknown>, TContext = unknown>(options?: {
    mutation?: UseMutationOptions<Awaited<ReturnType<typeof logout>>, TError, void, TContext>;
    request?: SecondParameter<typeof customFetch>;
}) => UseMutationResult<Awaited<ReturnType<typeof logout>>, TError, void, TContext>;
/**
 * @summary Get current user session
 */
export declare const getGetCurrentUserUrl: () => string;
export declare const getCurrentUser: (options?: RequestInit) => Promise<User>;
export declare const getGetCurrentUserQueryKey: () => readonly ["/api/auth/me"];
export declare const getGetCurrentUserQueryOptions: <TData = Awaited<ReturnType<typeof getCurrentUser>>, TError = ErrorType<ErrorResponse>>(options?: {
    query?: UseQueryOptions<Awaited<ReturnType<typeof getCurrentUser>>, TError, TData>;
    request?: SecondParameter<typeof customFetch>;
}) => UseQueryOptions<Awaited<ReturnType<typeof getCurrentUser>>, TError, TData> & {
    queryKey: QueryKey;
};
export type GetCurrentUserQueryResult = NonNullable<Awaited<ReturnType<typeof getCurrentUser>>>;
export type GetCurrentUserQueryError = ErrorType<ErrorResponse>;
/**
 * @summary Get current user session
 */
export declare function useGetCurrentUser<TData = Awaited<ReturnType<typeof getCurrentUser>>, TError = ErrorType<ErrorResponse>>(options?: {
    query?: UseQueryOptions<Awaited<ReturnType<typeof getCurrentUser>>, TError, TData>;
    request?: SecondParameter<typeof customFetch>;
}): UseQueryResult<TData, TError> & {
    queryKey: QueryKey;
};
/**
 * @summary Get bookings (own for visitors, all for staff)
 */
export declare const getGetBookingsUrl: (params?: GetBookingsParams) => string;
export declare const getBookings: (params?: GetBookingsParams, options?: RequestInit) => Promise<Booking[]>;
export declare const getGetBookingsQueryKey: (params?: GetBookingsParams) => readonly ["/api/bookings", ...GetBookingsParams[]];
export declare const getGetBookingsQueryOptions: <TData = Awaited<ReturnType<typeof getBookings>>, TError = ErrorType<ErrorResponse>>(params?: GetBookingsParams, options?: {
    query?: UseQueryOptions<Awaited<ReturnType<typeof getBookings>>, TError, TData>;
    request?: SecondParameter<typeof customFetch>;
}) => UseQueryOptions<Awaited<ReturnType<typeof getBookings>>, TError, TData> & {
    queryKey: QueryKey;
};
export type GetBookingsQueryResult = NonNullable<Awaited<ReturnType<typeof getBookings>>>;
export type GetBookingsQueryError = ErrorType<ErrorResponse>;
/**
 * @summary Get bookings (own for visitors, all for staff)
 */
export declare function useGetBookings<TData = Awaited<ReturnType<typeof getBookings>>, TError = ErrorType<ErrorResponse>>(params?: GetBookingsParams, options?: {
    query?: UseQueryOptions<Awaited<ReturnType<typeof getBookings>>, TError, TData>;
    request?: SecondParameter<typeof customFetch>;
}): UseQueryResult<TData, TError> & {
    queryKey: QueryKey;
};
/**
 * @summary Create a visit booking request
 */
export declare const getCreateBookingUrl: () => string;
export declare const createBooking: (createBookingRequest: CreateBookingRequest, options?: RequestInit) => Promise<Booking>;
export declare const getCreateBookingMutationOptions: <TError = ErrorType<ErrorResponse>, TContext = unknown>(options?: {
    mutation?: UseMutationOptions<Awaited<ReturnType<typeof createBooking>>, TError, {
        data: BodyType<CreateBookingRequest>;
    }, TContext>;
    request?: SecondParameter<typeof customFetch>;
}) => UseMutationOptions<Awaited<ReturnType<typeof createBooking>>, TError, {
    data: BodyType<CreateBookingRequest>;
}, TContext>;
export type CreateBookingMutationResult = NonNullable<Awaited<ReturnType<typeof createBooking>>>;
export type CreateBookingMutationBody = BodyType<CreateBookingRequest>;
export type CreateBookingMutationError = ErrorType<ErrorResponse>;
/**
 * @summary Create a visit booking request
 */
export declare const useCreateBooking: <TError = ErrorType<ErrorResponse>, TContext = unknown>(options?: {
    mutation?: UseMutationOptions<Awaited<ReturnType<typeof createBooking>>, TError, {
        data: BodyType<CreateBookingRequest>;
    }, TContext>;
    request?: SecondParameter<typeof customFetch>;
}) => UseMutationResult<Awaited<ReturnType<typeof createBooking>>, TError, {
    data: BodyType<CreateBookingRequest>;
}, TContext>;
/**
 * @summary Get a single booking
 */
export declare const getGetBookingUrl: (id: number) => string;
export declare const getBooking: (id: number, options?: RequestInit) => Promise<Booking>;
export declare const getGetBookingQueryKey: (id: number) => readonly [`/api/bookings/${number}`];
export declare const getGetBookingQueryOptions: <TData = Awaited<ReturnType<typeof getBooking>>, TError = ErrorType<ErrorResponse>>(id: number, options?: {
    query?: UseQueryOptions<Awaited<ReturnType<typeof getBooking>>, TError, TData>;
    request?: SecondParameter<typeof customFetch>;
}) => UseQueryOptions<Awaited<ReturnType<typeof getBooking>>, TError, TData> & {
    queryKey: QueryKey;
};
export type GetBookingQueryResult = NonNullable<Awaited<ReturnType<typeof getBooking>>>;
export type GetBookingQueryError = ErrorType<ErrorResponse>;
/**
 * @summary Get a single booking
 */
export declare function useGetBooking<TData = Awaited<ReturnType<typeof getBooking>>, TError = ErrorType<ErrorResponse>>(id: number, options?: {
    query?: UseQueryOptions<Awaited<ReturnType<typeof getBooking>>, TError, TData>;
    request?: SecondParameter<typeof customFetch>;
}): UseQueryResult<TData, TError> & {
    queryKey: QueryKey;
};
/**
 * @summary Approve a booking (staff only)
 */
export declare const getApproveBookingUrl: (id: number) => string;
export declare const approveBooking: (id: number, options?: RequestInit) => Promise<Booking>;
export declare const getApproveBookingMutationOptions: <TError = ErrorType<ErrorResponse>, TContext = unknown>(options?: {
    mutation?: UseMutationOptions<Awaited<ReturnType<typeof approveBooking>>, TError, {
        id: number;
    }, TContext>;
    request?: SecondParameter<typeof customFetch>;
}) => UseMutationOptions<Awaited<ReturnType<typeof approveBooking>>, TError, {
    id: number;
}, TContext>;
export type ApproveBookingMutationResult = NonNullable<Awaited<ReturnType<typeof approveBooking>>>;
export type ApproveBookingMutationError = ErrorType<ErrorResponse>;
/**
 * @summary Approve a booking (staff only)
 */
export declare const useApproveBooking: <TError = ErrorType<ErrorResponse>, TContext = unknown>(options?: {
    mutation?: UseMutationOptions<Awaited<ReturnType<typeof approveBooking>>, TError, {
        id: number;
    }, TContext>;
    request?: SecondParameter<typeof customFetch>;
}) => UseMutationResult<Awaited<ReturnType<typeof approveBooking>>, TError, {
    id: number;
}, TContext>;
/**
 * @summary Reject a booking (staff only)
 */
export declare const getRejectBookingUrl: (id: number) => string;
export declare const rejectBooking: (id: number, rejectBookingRequest?: RejectBookingRequest, options?: RequestInit) => Promise<Booking>;
export declare const getRejectBookingMutationOptions: <TError = ErrorType<ErrorResponse>, TContext = unknown>(options?: {
    mutation?: UseMutationOptions<Awaited<ReturnType<typeof rejectBooking>>, TError, {
        id: number;
        data: BodyType<RejectBookingRequest>;
    }, TContext>;
    request?: SecondParameter<typeof customFetch>;
}) => UseMutationOptions<Awaited<ReturnType<typeof rejectBooking>>, TError, {
    id: number;
    data: BodyType<RejectBookingRequest>;
}, TContext>;
export type RejectBookingMutationResult = NonNullable<Awaited<ReturnType<typeof rejectBooking>>>;
export type RejectBookingMutationBody = BodyType<RejectBookingRequest>;
export type RejectBookingMutationError = ErrorType<ErrorResponse>;
/**
 * @summary Reject a booking (staff only)
 */
export declare const useRejectBooking: <TError = ErrorType<ErrorResponse>, TContext = unknown>(options?: {
    mutation?: UseMutationOptions<Awaited<ReturnType<typeof rejectBooking>>, TError, {
        id: number;
        data: BodyType<RejectBookingRequest>;
    }, TContext>;
    request?: SecondParameter<typeof customFetch>;
}) => UseMutationResult<Awaited<ReturnType<typeof rejectBooking>>, TError, {
    id: number;
    data: BodyType<RejectBookingRequest>;
}, TContext>;
/**
 * @summary Cancel a booking (visitor cancels own, staff can cancel any)
 */
export declare const getCancelBookingUrl: (id: number) => string;
export declare const cancelBooking: (id: number, options?: RequestInit) => Promise<Booking>;
export declare const getCancelBookingMutationOptions: <TError = ErrorType<ErrorResponse>, TContext = unknown>(options?: {
    mutation?: UseMutationOptions<Awaited<ReturnType<typeof cancelBooking>>, TError, {
        id: number;
    }, TContext>;
    request?: SecondParameter<typeof customFetch>;
}) => UseMutationOptions<Awaited<ReturnType<typeof cancelBooking>>, TError, {
    id: number;
}, TContext>;
export type CancelBookingMutationResult = NonNullable<Awaited<ReturnType<typeof cancelBooking>>>;
export type CancelBookingMutationError = ErrorType<ErrorResponse>;
/**
 * @summary Cancel a booking (visitor cancels own, staff can cancel any)
 */
export declare const useCancelBooking: <TError = ErrorType<ErrorResponse>, TContext = unknown>(options?: {
    mutation?: UseMutationOptions<Awaited<ReturnType<typeof cancelBooking>>, TError, {
        id: number;
    }, TContext>;
    request?: SecondParameter<typeof customFetch>;
}) => UseMutationResult<Awaited<ReturnType<typeof cancelBooking>>, TError, {
    id: number;
}, TContext>;
/**
 * @summary Get visitor's booking statistics
 */
export declare const getGetVisitorStatsUrl: () => string;
export declare const getVisitorStats: (options?: RequestInit) => Promise<VisitorStats>;
export declare const getGetVisitorStatsQueryKey: () => readonly ["/api/dashboard/visitor-stats"];
export declare const getGetVisitorStatsQueryOptions: <TData = Awaited<ReturnType<typeof getVisitorStats>>, TError = ErrorType<ErrorResponse>>(options?: {
    query?: UseQueryOptions<Awaited<ReturnType<typeof getVisitorStats>>, TError, TData>;
    request?: SecondParameter<typeof customFetch>;
}) => UseQueryOptions<Awaited<ReturnType<typeof getVisitorStats>>, TError, TData> & {
    queryKey: QueryKey;
};
export type GetVisitorStatsQueryResult = NonNullable<Awaited<ReturnType<typeof getVisitorStats>>>;
export type GetVisitorStatsQueryError = ErrorType<ErrorResponse>;
/**
 * @summary Get visitor's booking statistics
 */
export declare function useGetVisitorStats<TData = Awaited<ReturnType<typeof getVisitorStats>>, TError = ErrorType<ErrorResponse>>(options?: {
    query?: UseQueryOptions<Awaited<ReturnType<typeof getVisitorStats>>, TError, TData>;
    request?: SecondParameter<typeof customFetch>;
}): UseQueryResult<TData, TError> & {
    queryKey: QueryKey;
};
/**
 * @summary Get staff overview statistics
 */
export declare const getGetStaffStatsUrl: () => string;
export declare const getStaffStats: (options?: RequestInit) => Promise<StaffStats>;
export declare const getGetStaffStatsQueryKey: () => readonly ["/api/dashboard/staff-stats"];
export declare const getGetStaffStatsQueryOptions: <TData = Awaited<ReturnType<typeof getStaffStats>>, TError = ErrorType<ErrorResponse>>(options?: {
    query?: UseQueryOptions<Awaited<ReturnType<typeof getStaffStats>>, TError, TData>;
    request?: SecondParameter<typeof customFetch>;
}) => UseQueryOptions<Awaited<ReturnType<typeof getStaffStats>>, TError, TData> & {
    queryKey: QueryKey;
};
export type GetStaffStatsQueryResult = NonNullable<Awaited<ReturnType<typeof getStaffStats>>>;
export type GetStaffStatsQueryError = ErrorType<ErrorResponse>;
/**
 * @summary Get staff overview statistics
 */
export declare function useGetStaffStats<TData = Awaited<ReturnType<typeof getStaffStats>>, TError = ErrorType<ErrorResponse>>(options?: {
    query?: UseQueryOptions<Awaited<ReturnType<typeof getStaffStats>>, TError, TData>;
    request?: SecondParameter<typeof customFetch>;
}): UseQueryResult<TData, TError> & {
    queryKey: QueryKey;
};
/**
 * @summary Get recent booking activity (staff only)
 */
export declare const getGetRecentActivityUrl: () => string;
export declare const getRecentActivity: (options?: RequestInit) => Promise<ActivityItem[]>;
export declare const getGetRecentActivityQueryKey: () => readonly ["/api/dashboard/recent-activity"];
export declare const getGetRecentActivityQueryOptions: <TData = Awaited<ReturnType<typeof getRecentActivity>>, TError = ErrorType<ErrorResponse>>(options?: {
    query?: UseQueryOptions<Awaited<ReturnType<typeof getRecentActivity>>, TError, TData>;
    request?: SecondParameter<typeof customFetch>;
}) => UseQueryOptions<Awaited<ReturnType<typeof getRecentActivity>>, TError, TData> & {
    queryKey: QueryKey;
};
export type GetRecentActivityQueryResult = NonNullable<Awaited<ReturnType<typeof getRecentActivity>>>;
export type GetRecentActivityQueryError = ErrorType<ErrorResponse>;
/**
 * @summary Get recent booking activity (staff only)
 */
export declare function useGetRecentActivity<TData = Awaited<ReturnType<typeof getRecentActivity>>, TError = ErrorType<ErrorResponse>>(options?: {
    query?: UseQueryOptions<Awaited<ReturnType<typeof getRecentActivity>>, TError, TData>;
    request?: SecondParameter<typeof customFetch>;
}): UseQueryResult<TData, TError> & {
    queryKey: QueryKey;
};
export {};
//# sourceMappingURL=api.d.ts.map