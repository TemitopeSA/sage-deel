import type { CountryCode } from "@/types";

// Fictional names representing an international workforce. Any resemblance to real people is coincidental.
export const namePools: Record<CountryCode, { first: string[]; last: string[] }> = {
  US: {
    first: ["Jordan", "Emily", "Marcus", "Priya", "Daniel", "Aaliyah", "Ryan", "Megan", "Carlos", "Hannah", "Tyler", "Grace", "Kevin", "Olivia", "Brandon", "Sofia", "Nathan", "Jasmine"],
    last: ["Brooks", "Carter", "Nguyen", "Reyes", "Sullivan", "Patel", "Hayes", "Bennett", "Coleman", "Foster", "Ramirez", "Wallace", "Kim"],
  },
  UK: {
    first: ["Oliver", "Amelia", "Harry", "Isla", "George", "Poppy", "Callum", "Freya", "Rhys", "Imogen", "Aidan", "Niamh", "Tom", "Leah"],
    last: ["Whitaker", "Hughes", "Pemberton", "Ashworth", "Clarke", "Doyle", "Fletcher", "Barnes", "Okoye", "Shah", "Lloyd"],
  },
  DE: {
    first: ["Jonas", "Lea", "Felix", "Hannah", "Lukas", "Mia", "Maximilian", "Clara", "Paul", "Johanna", "Tobias", "Katharina"],
    last: ["Schneider", "Becker", "Hoffmann", "Wagner", "Krüger", "Richter", "Neumann", "Zimmermann", "Braun", "Hartmann"],
  },
  PL: {
    first: ["Jakub", "Zuzanna", "Kacper", "Julia", "Mateusz", "Maja", "Piotr", "Aleksandra", "Tomasz", "Natalia", "Michał", "Karolina", "Bartosz", "Weronika"],
    last: ["Kowalski", "Nowak", "Wiśniewski", "Wójcik", "Kamińska", "Lewandowski", "Zielińska", "Szymański", "Dąbrowska", "Mazur", "Jankowski"],
  },
  PT: {
    first: ["Tiago", "Beatriz", "Rui", "Inês", "Duarte", "Mariana", "Gonçalo", "Leonor", "Miguel", "Carolina", "André", "Matilde"],
    last: ["Ferreira", "Costa", "Almeida", "Sousa", "Pereira", "Rodrigues", "Martins", "Carvalho", "Lopes", "Gomes"],
  },
  BR: {
    first: ["Lucas", "Camila", "Gabriel", "Larissa", "Rafael", "Beatriz", "Thiago", "Juliana", "Felipe", "Amanda", "Bruno", "Fernanda"],
    last: ["Silva", "Oliveira", "Santos", "Souza", "Lima", "Araújo", "Ribeiro", "Barbosa", "Moreira", "Cardoso"],
  },
  NG: {
    first: ["Adaeze", "Tunde", "Ngozi", "Emeka", "Funmilayo", "Ibrahim", "Chiamaka", "Olumide", "Zainab", "Obinna", "Temilade", "Kelechi"],
    last: ["Adeyemi", "Nwosu", "Balogun", "Eze", "Okonkwo", "Bello", "Afolabi", "Nnamdi", "Oyelaran", "Uche"],
  },
  IN: {
    first: ["Aarav", "Ananya", "Vikram", "Diya", "Karthik", "Meera", "Siddharth", "Ishita", "Rahul", "Neha", "Arjun", "Kavya", "Aditya", "Pooja", "Nikhil"],
    last: ["Sharma", "Reddy", "Iyer", "Gupta", "Menon", "Nair", "Kulkarni", "Banerjee", "Rao", "Joshi", "Chopra"],
  },
};
