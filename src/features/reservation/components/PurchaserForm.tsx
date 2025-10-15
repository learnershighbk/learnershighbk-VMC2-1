'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useSeatSelection } from '../hooks/useSeatSelection';
import { useReservationMutation } from '../hooks/useReservationMutation';
import { selectIsReserveDisabled, selectSelectedSeatIds, selectTotalAmount } from '../state/selectors';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { useToast } from '@/hooks/use-toast';
import { VALIDATION_MESSAGES } from '../constants/validation-rules';

export const PurchaserForm = () => {
  const router = useRouter();
  const { state, dispatch } = useSeatSelection();
  const { toast } = useToast();
  const reservationMutation = useReservationMutation();
  const isDisabled = selectIsReserveDisabled(state);
  const selectedSeatIds = selectSelectedSeatIds(state);
  const totalAmount = selectTotalAmount(state);

  const [errors, setErrors] = useState<Record<string, string>>({});

  const validatePhone = (phone: string) => {
    if (!phone) {
      return VALIDATION_MESSAGES.phoneRequired;
    }
    if (!/^[0-9]{10,11}$/.test(phone)) {
      return VALIDATION_MESSAGES.phoneInvalid;
    }
    return null;
  };

  const validatePassword = (password: string) => {
    if (!password) {
      return VALIDATION_MESSAGES.passwordRequired;
    }
    if (!/^[0-9]{4}$/.test(password)) {
      return VALIDATION_MESSAGES.passwordInvalid;
    }
    return null;
  };

  const handlePhoneChange = (value: string) => {
    const numericValue = value.replace(/[^0-9]/g, '');
    dispatch({
      type: 'SET_PURCHASER_FIELD',
      payload: { field: 'phoneNumber', value: numericValue },
    });

    const error = validatePhone(numericValue);
    if (error) {
      setErrors((prev) => ({ ...prev, phoneNumber: error }));
    } else {
      setErrors((prev) => {
        const { phoneNumber, ...rest } = prev;
        return rest;
      });
    }
  };

  const handlePasswordChange = (value: string) => {
    const numericValue = value.replace(/[^0-9]/g, '').slice(0, 4);
    dispatch({
      type: 'SET_PURCHASER_FIELD',
      payload: { field: 'password', value: numericValue },
    });

    const error = validatePassword(numericValue);
    if (error) {
      setErrors((prev) => ({ ...prev, password: error }));
    } else {
      setErrors((prev) => {
        const { password, ...rest } = prev;
        return rest;
      });
    }
  };

  const handleTermsChange = (checked: boolean) => {
    dispatch({
      type: 'TOGGLE_TERMS',
      payload: { checked },
    });
  };

  const handleSubmit = async () => {
    const phoneError = validatePhone(state.purchaser.phoneNumber);
    const passwordError = validatePassword(state.purchaser.password);

    if (phoneError || passwordError) {
      setErrors({
        ...(phoneError && { phoneNumber: phoneError }),
        ...(passwordError && { password: passwordError }),
      });
      return;
    }

    if (!state.agreementFlags.terms) {
      toast({
        variant: 'destructive',
        title: '약관 동의 필요',
        description: VALIDATION_MESSAGES.termsRequired,
      });
      return;
    }

    if (selectedSeatIds.length === 0) {
      toast({
        variant: 'destructive',
        title: '좌석 선택 필요',
        description: VALIDATION_MESSAGES.seatsRequired,
      });
      return;
    }

    dispatch({
      type: 'SET_ASYNC_STATUS',
      payload: { operation: 'reserve', status: 'loading' },
    });

    try {
      const result = await reservationMutation.mutateAsync({
        concertId: state.concertId!,
        seatIds: selectedSeatIds,
        phoneNumber: state.purchaser.phoneNumber,
        password: state.purchaser.password,
        expectedTotal: totalAmount,
      });

      dispatch({
        type: 'SET_ASYNC_STATUS',
        payload: { operation: 'reserve', status: 'success' },
      });

      toast({
        title: '예약 완료',
        description: '예약이 성공적으로 완료되었습니다',
      });

      setTimeout(() => {
        router.push(`/reservations/${result.reservationId}/success?code=${result.reservationCode}`);
      }, 100);
    } catch (error: unknown) {
      dispatch({
        type: 'SET_ASYNC_STATUS',
        payload: { operation: 'reserve', status: 'error' },
      });

      const errorMessage = error instanceof Error ? error.message : '예약 중 오류가 발생했습니다';
      
      console.error('예약 실패:', error);
      
      toast({
        variant: 'destructive',
        title: '예약 실패',
        description: errorMessage,
      });
    }
  };

  return (
    <Card className="p-6">
      <h2 className="text-lg font-semibold mb-4">예약자 정보</h2>

      <div className="space-y-4">
        <div>
          <Label htmlFor="phoneNumber">전화번호</Label>
          <Input
            id="phoneNumber"
            type="tel"
            placeholder="01012345678"
            value={state.purchaser.phoneNumber}
            onChange={(e) => handlePhoneChange(e.target.value)}
            maxLength={11}
          />
          {errors.phoneNumber && (
            <p className="text-sm text-red-600 mt-1">{errors.phoneNumber}</p>
          )}
        </div>

        <div>
          <Label htmlFor="password">비밀번호 (숫자 4자리)</Label>
          <Input
            id="password"
            type="password"
            placeholder="1234"
            value={state.purchaser.password}
            onChange={(e) => handlePasswordChange(e.target.value)}
            maxLength={4}
          />
          {errors.password && (
            <p className="text-sm text-red-600 mt-1">{errors.password}</p>
          )}
          <p className="text-xs text-gray-500 mt-1">
            예약 조회 시 사용됩니다
          </p>
        </div>

        <div className="flex items-center space-x-2">
          <Checkbox
            id="terms"
            checked={state.agreementFlags.terms}
            onCheckedChange={handleTermsChange}
          />
          <Label htmlFor="terms" className="text-sm cursor-pointer">
            개인정보 수집 및 이용에 동의합니다
          </Label>
        </div>

        <Button
          onClick={handleSubmit}
          disabled={isDisabled}
          className="w-full"
          size="lg"
        >
          {state.asyncStatus.reserve === 'loading' ? '예약 중...' : '예약하기'}
        </Button>
      </div>
    </Card>
  );
};

