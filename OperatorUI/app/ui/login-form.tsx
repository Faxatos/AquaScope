'use client';

import {
  AtSymbolIcon,
  KeyIcon,
  ExclamationCircleIcon,
} from '@heroicons/react/24/outline';
import { ArrowRightIcon } from '@heroicons/react/20/solid';
import { Button } from '@/app/ui/button';
import { useActionState } from 'react';
import { authenticate } from '@/app/lib/actions';
import AquaScopeLogoHome from '@/app/ui/aquascope-logo';

import Link from 'next/link';

export default function LoginForm() {
  const [errorMessage, formAction, isPending] = useActionState(
    authenticate,
    undefined,
  );

  return (
    <form
      action={formAction}
      className="max-w-md mx-auto space-y-6 rounded-lg bg-white p-8 shadow-lg"
    >
      <div className="flex justify-center rounded-lg mb-6 bg-blue-500 p-4">
        <AquaScopeLogoHome /> 
      </div>

      <h1 className="text-3xl font-semibold text-gray-800 text-center">
        Welcome Back
      </h1>
      <p className="text-sm text-gray-500 text-center">
        Please log in to access your account.
      </p>
      <div className="space-y-4">
        {/* Email Field */}
        <div>
          <label
            className="block mb-2 text-sm font-medium text-gray-700"
            htmlFor="email"
          >
            Email
          </label>
          <div className="relative">
            <input
              className="peer block w-full rounded-md border border-gray-300 bg-gray-50 py-2 pl-10 pr-3 text-sm text-gray-700 placeholder-gray-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-500"
              id="email"
              type="email"
              name="email"
              placeholder="Enter your email address"
              required
            />
            <AtSymbolIcon className="pointer-events-none absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400 peer-focus:text-blue-500" />
          </div>
        </div>
        {/* Password Field */}
        <div>
          <label
            className="block mb-2 text-sm font-medium text-gray-700"
            htmlFor="password"
          >
            Password
          </label>
          <div className="relative">
            <input
              className="peer block w-full rounded-md border border-gray-300 bg-gray-50 py-2 pl-10 pr-3 text-sm text-gray-700 placeholder-gray-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-500"
              id="password"
              type="password"
              name="password"
              placeholder="Enter your password"
              required
              minLength={6}
            />
            <KeyIcon className="pointer-events-none absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400 peer-focus:text-blue-500" />
          </div>
        </div>
      </div>
      <Button
        className="mt-4 flex w-full items-center justify-center rounded-md bg-blue-500 px-4 py-2 text-white font-medium text-sm hover:bg-blue-400 disabled:bg-gray-300 disabled:cursor-not-allowed"
        aria-disabled={isPending}
      >
        Log in <ArrowRightIcon className="ml-2 h-5 w-5" />
      </Button>
      
      {errorMessage && (
        <div
          className="mt-4 flex items-center space-x-2 rounded-md bg-red-50 p-3 text-red-500"
          aria-live="polite"
          aria-atomic="true"
        >
          <ExclamationCircleIcon className="h-5 w-5" />
          <p className="text-sm">{errorMessage}</p>
        </div>
      )}

      {/* Go Back Button with Link */}
      <Link href="/" passHref>
          <button
          className="mt-4 flex w-full items-center justify-center rounded-md bg-gray-500 px-4 py-2 text-white font-medium text-sm hover:bg-gray-400 disabled:bg-gray-300 disabled:cursor-not-allowed"
          >
          Go Back
          </button>
      </Link>
    </form>
  );
}
