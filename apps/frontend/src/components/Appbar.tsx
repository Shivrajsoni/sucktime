"use client";
import {
    SignInButton,
    SignUpButton,
    SignedIn,
    SignedOut,
    UserButton,
} from '@clerk/nextjs';
import { Button } from './ui/button';

export function Appbar(){
    return (
        <div className='flex justify-between items-center p-4'>
            <h1 className="text-3xl font-extrabold">Suck Time</h1>
            <div>
                <SignedOut>
                    <SignUpButton/>
                    <SignInButton/>
                </SignedOut>
                <SignedIn>
                    <UserButton/>
                </SignedIn>
            </div>
        </div>
    )
}