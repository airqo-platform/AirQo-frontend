import * as z from "zod";

export const networkFormSchema = z.object({
    net_name: z.string().min(2, "Sensor Manufacturer name must be at least 2 characters."),
    net_acronym: z.string().min(2, "Acronym must be at least 2 characters."),
    net_username: z.string().min(2, "Username must be at least 2 characters."),
    net_email: z.string().email("Invalid email address."),
    net_website: z.string().url("Invalid URL."),
    net_phoneNumber: z.string().min(10, "Phone number seems too short."),
    net_category: z.enum(["business", "research", "policy", "awareness", "school", "others"], {
        errorMap: () => ({ message: "Please select a valid category" }),
    }),
    net_description: z.string().min(10, "Description is too short."),
    net_connection_endpoint: z.string().url("Invalid URL."),
    net_connection_string: z.string().url("Invalid URL."),
});

export type NetworkFormValues = z.infer<typeof networkFormSchema>;
