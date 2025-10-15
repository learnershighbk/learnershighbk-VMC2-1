'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { SearchFormSchema, type SearchFormData } from '../lib/validation';
import { cleanPhoneNumber } from '@/lib/utils/phone-formatter';

interface ReservationSearchFormProps {
  onSubmit: (data: SearchFormData) => void;
  isLoading: boolean;
}

export const ReservationSearchForm = ({ onSubmit, isLoading }: ReservationSearchFormProps) => {
  const form = useForm<SearchFormData>({
    resolver: zodResolver(SearchFormSchema),
    defaultValues: {
      phoneNumber: '',
      password: '',
    },
  });

  const handleSubmit = (data: SearchFormData) => {
    const cleanedData = {
      ...data,
      phoneNumber: cleanPhoneNumber(data.phoneNumber),
    };
    onSubmit(cleanedData);
  };

  return (
    <Card className="p-6">
      <Form {...form}>
        <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
          <div className="space-y-4">
            <FormField
              control={form.control}
              name="phoneNumber"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>전화번호</FormLabel>
                  <FormControl>
                    <Input
                      {...field}
                      type="tel"
                      placeholder="01012345678"
                      disabled={isLoading}
                      onChange={(e) => {
                        const cleaned = cleanPhoneNumber(e.target.value);
                        field.onChange(cleaned);
                      }}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="password"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>비밀번호</FormLabel>
                  <FormControl>
                    <Input
                      {...field}
                      type="password"
                      placeholder="숫자 4자리"
                      maxLength={4}
                      disabled={isLoading}
                      onChange={(e) => {
                        const cleaned = e.target.value.replace(/\D/g, '');
                        field.onChange(cleaned);
                      }}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          <Button
            type="submit"
            className="w-full"
            disabled={isLoading}
          >
            {isLoading ? '조회 중...' : '조회하기'}
          </Button>
        </form>
      </Form>
    </Card>
  );
};

