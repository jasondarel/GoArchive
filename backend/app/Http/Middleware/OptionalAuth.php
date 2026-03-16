<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

class OptionalAuth
{
    /**
     * Attempt to authenticate the user if a valid Bearer token is present,
     * but allow the request to proceed even if there is no token or it is invalid.
     */
    public function handle(Request $request, Closure $next)
    {
        // Try Sanctum token auth silently — ignore any failure
        try {
            Auth::guard('sanctum')->authenticate();
        } catch (\Throwable) {
            // No valid token — continue as guest
        }

        return $next($request);
    }
}
