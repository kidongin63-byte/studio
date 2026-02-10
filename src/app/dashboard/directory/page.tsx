"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { members, type Member } from "@/lib/data";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  CardFooter
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Phone, Home, Search, User } from "lucide-react";

export default function DirectoryPage() {
  const [searchTerm, setSearchTerm] = useState("");

  const filteredMembers = members.filter((member) =>
    member.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold font-headline">Member Directory</h1>
        <p className="text-muted-foreground">
          Find and connect with fellow members.
        </p>
      </div>

      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
        <Input
          type="text"
          placeholder="Search by name..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full max-w-sm pl-10"
        />
      </div>

      {filteredMembers.length > 0 ? (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {filteredMembers.map((member) => (
            <Card key={member.id} className="flex flex-col">
              <CardHeader className="flex-row items-center gap-4">
                <Image
                  src={member.avatarUrl}
                  alt={`Avatar of ${member.name}`}
                  width={64}
                  height={64}
                  className="rounded-full border-2 border-primary/20"
                />
                <div>
                  <CardTitle className="font-headline">{member.name}</CardTitle>
                  <CardDescription>Member</CardDescription>
                </div>
              </CardHeader>
              <CardContent className="space-y-3 flex-grow">
                <div className="flex items-start gap-3">
                  <Phone className="h-4 w-4 mt-1 shrink-0 text-muted-foreground" />
                  <span className="text-sm">{member.phone}</span>
                </div>
                <div className="flex items-start gap-3">
                  <Home className="h-4 w-4 mt-1 shrink-0 text-muted-foreground" />
                  <span className="text-sm">{member.address}</span>
                </div>
              </CardContent>
              <CardFooter className="flex-col sm:flex-row gap-2">
                 <a href={`tel:${member.phone}`} className="w-full">
                  <Button variant="outline" className="w-full">
                    <Phone className="mr-2 h-4 w-4" /> Call
                  </Button>
                </a>
                <Link href={`/dashboard/members/${member.id}`} className="w-full">
                  <Button className="w-full">
                    <User className="mr-2 h-4 w-4" /> Profile
                  </Button>
                </Link>
              </CardFooter>
            </Card>
          ))}
        </div>
      ) : (
        <div className="text-center py-16 text-muted-foreground">
          <p>No members found matching your search.</p>
        </div>
      )}
    </div>
  );
}
