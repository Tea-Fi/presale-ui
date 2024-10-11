import React from "react";

import { z } from "zod";
import { isAddress } from "ethers";
import { useAccount, useSignMessage } from "wagmi";
import { Form, Formik, Field, ErrorMessage } from "formik";
import { SlIcon } from "@shoelace-style/shoelace/dist/react";

import { Button } from "../ui";
import { cn } from "../../utils/cn";
import * as referrals from "../../utils/referrals";
import type { Referral } from "../../utils/referrals";

const ReferralValidationSchema = z.object({
  walletAddress: z.string().refine((x) => isAddress(x), {
    message: "Is not a valid address",
  }),

  referralCode: z.string(),
});

type ReferralPayload = z.infer<typeof ReferralValidationSchema> & {
  fee: number;
};

const initialValues: ReferralPayload = {
  walletAddress: "",
  referralCode: "",
  fee: 10,
};

interface FormFieldProps {
  label: string;
  name: string;
  error?: string;
  validate?: (value: any) => Promise<Record<string, string>>;
  validateOnBlur?: boolean;
}

const FormField: React.FC<FormFieldProps & React.PropsWithChildren> = (
  props
) => {
  return (
    <div className="referral-form-field">
      <div className="referral-form-field__label">{props.label}</div>

      {props.children}

      {!props.children && (
        <div className="referral-form-field__input">
          <Field name={props.name} />
        </div>
      )}

      {props.error && (
        <div className="referral-form-field__error">
          <ErrorMessage name={props.name} />
        </div>
      )}
    </div>
  );
};

interface Props {
  referralTree: Referral;
  onSubmit: () => void;
}

export const ReferralForm: React.FC<Props> = (props) => {
  const account = useAccount();

  const { signMessageAsync } = useSignMessage();

  const [showForm, setShowform] = React.useState(false);
  const [isLoading, setIsLoading] = React.useState(false);
  const [error, setError] = React.useState<string | undefined>();

  const isDisabled = React.useMemo(
    () => (props.referralTree.fee ?? 0) <= 10,
    [props.referralTree.fee]
  );

  const validationSchema = React.useMemo(
    () =>
      ReferralValidationSchema.extend({
        fee: z
          .number()
          .int()
          .min(10)
          .max(props.referralTree.fee! - 10),
      }),
    [props.referralTree]
  );

  const toggleForm = React.useCallback(() => {
    setShowform((state) => !state);
  }, []);

  const hideFormOnClick = React.useCallback(
    (e: React.MouseEvent<HTMLDivElement, MouseEvent>) => {
      if (e.currentTarget != e.target) return;

      setShowform(false);
    },
    []
  );

  const validate = React.useCallback(async (values: ReferralPayload) => {
    const validation = validationSchema.safeParse(values);

    let result: Record<string, string> = {};

    if (!validation.success) {
      const errors = validation.error.issues
        .map((x) => ({ [x.path[0]]: x.message }))
        .reduce((acc, e) => ({ ...acc, ...e }));

      result = Object.assign(result, errors);
    }

    if (values.referralCode) {
      const codeExists = await referrals.referralCodeExists(
        values.referralCode
      );

      if (codeExists) {
        result["referralCode"] = "Referral code already exists";
      }
    }

    return result;
  }, []);

  const onSubmit = React.useCallback(
    async (values: ReferralPayload) => {
      setError(undefined);

      if (!account?.address) {
        setError("Wallet not connected");
        return;
      }

      try {
        setIsLoading(true);
        const signPayload = await referrals.generateSignature(
          account.address!,
          values
        );

        const signedMessage = await signMessageAsync({
          message: `0x${signPayload}`,
        });

        const payload = {
          ...values,
          signature: signedMessage,
          senderAddress: account.address!,
        };

        await referrals.createReferral(props.referralTree.referral!, payload);

        setShowform(false);
        props.onSubmit();
      } catch (err) {
        setError(`${err}`);
      } finally {
        setIsLoading(false);
      }
    },
    [props.onSubmit, account]
  );

  return (
    <>
      <Button
        disabled={isDisabled}
        onClick={toggleForm}
        className={cn(
          "px-8 py-8",
          "text-xl ",
          "hover:bg-[#3a0c2a] transition-none",
          !isDisabled ? "bg-[#f716a2] text-secondary-foreground" : ""
        )}
      >
        Create Referral
      </Button>

      {showForm && (
        <Formik
          initialValues={initialValues}
          validate={validate}
          onSubmit={onSubmit}
          validateOnBlur={true}
          validateOnChange={false}
        >
          {({ values, errors }) => (
            <div className="referral-form-backdrop" onClick={hideFormOnClick}>
              <Form className="referral-form">
                <div className={cn("text-xl")}>Create new referral</div>

                <div className="referral-form__close" onClick={toggleForm}>
                  <SlIcon slot="icon" name="x-lg" />
                </div>

                <FormField
                  name="walletAddress"
                  label="Wallet Address"
                  error={errors.walletAddress}
                />

                <FormField
                  name="referralCode"
                  label="Referral Code"
                  error={errors.referralCode}
                />

                <FormField name="fee" label="Percentage" error={errors.fee}>
                  <div className="referral-form__slider">
                    <Field
                      type="range"
                      name="fee"
                      min="10"
                      max={props.referralTree.fee! - 10}
                      step="10"
                    />

                    <div>{(values.fee / 100).toFixed(2)}%</div>
                  </div>
                </FormField>

                {error && <div className="referral-form__error">{error}</div>}

                <Button
                  type="submit"
                  disabled={isLoading}
                  className={cn(
                    "px-8 py-4",
                    "bg-[#f716a2] text-secondary-foreground",
                    "hover:bg-[#3a0c2a] transition-none"
                  )}
                >
                  Create Sublead
                </Button>
              </Form>
            </div>
          )}
        </Formik>
      )}
    </>
  );
};
