import { notFound } from "next/navigation";
import Image from 'next/image';
import { members } from "@/lib/data";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Cake, Gift, Home, Utensils, Brush, Phone } from "lucide-react";
import { Badge } from "@/components/ui/badge";

type MajorBirthday = {
  name: string;
  year: number;
};

function calculateMajorBirthdays(birthDate: string): MajorBirthday[] {
  const birthYear = new Date(birthDate).getFullYear();
  return [
    { name: '환갑 (61세)', year: birthYear + 60 },
    { name: '칠순 (70세)', year: birthYear + 69 },
    { name: '팔순 (80세)', year: birthYear + 79 },
  ];
}


export default function MemberProfilePage({ params }: { params: { id: string } }) {
  const member = members.find((m) => m.id === params.id);

  if (!member) {
    notFound();
  }
  
  const majorBirthdays = calculateMajorBirthdays(member.birthDate);

  return (
    <div className="mx-auto max-w-4xl space-y-8">
      <div className="flex flex-col sm:flex-row items-center gap-6">
        <Image
          src={member.avatarUrl}
          alt={`Avatar of ${member.name}`}
          width={128}
          height={128}
          className="rounded-full border-4 border-primary/20 shadow-lg"
          priority
        />
        <div>
          <h1 className="text-4xl font-bold font-headline">{member.name}</h1>
          <p className="text-lg text-muted-foreground">Detailed Member Profile</p>
        </div>
      </div>
      
      <div className="grid md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Contact Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center gap-3">
              <Phone className="h-5 w-5 text-muted-foreground" />
              <div>
                <p className="text-sm font-medium">Phone Number</p>
                <p className="text-base">{member.phone}</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Home className="h-5 w-5 text-muted-foreground" />
              <div>
                <p className="text-sm font-medium">Address</p>
                <p className="text-base">{member.address}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Personal Details</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center gap-3">
              <Cake className="h-5 w-5 text-muted-foreground" />
              <div>
                <p className="text-sm font-medium">Birthday</p>
                <p className="text-base">{new Date(member.birthDate).toLocaleDateString()} {member.isLunar && <Badge variant="outline">Lunar</Badge>}</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Gift className="h-5 w-5 text-muted-foreground" />
              <div>
                <p className="text-sm font-medium">Wedding Anniversary</p>
                <p className="text-base">{new Date(member.anniversary).toLocaleDateString()}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
      
      <Card>
          <CardHeader>
            <CardTitle>Key Anniversary Years</CardTitle>
            <CardDescription>Automatically calculated milestones for future planning.</CardDescription>
          </CardHeader>
          <CardContent className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {majorBirthdays.map((bday) => (
                <div key={bday.name} className="p-4 bg-secondary/50 rounded-lg text-center">
                    <p className="font-semibold">{bday.name}</p>
                    <p className="text-2xl font-bold text-primary">{bday.year}년</p>
                </div>
            ))}
          </CardContent>
        </Card>

      <Card>
        <CardHeader>
          <CardTitle>Preferences</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-start gap-3">
            <Utensils className="h-5 w-5 mt-1 text-muted-foreground" />
            <div>
              <p className="text-sm font-medium">Favorite Foods</p>
              <p className="text-base">{member.preferences.food}</p>
            </div>
          </div>
          <div className="flex items-start gap-3">
            <Brush className="h-5 w-5 mt-1 text-muted-foreground" />
            <div>
              <p className="text-sm font-medium">Hobbies</p>
              <p className="text-base">{member.preferences.hobbies}</p>
            </div>
          </div>
        </CardContent>
      </Card>

    </div>
  );
}
