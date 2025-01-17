


``` py title="SystemX"
    def get_fixed_destination_call_facility(self, directory_number, line_number, tariff_level):
        command = "RD-FDC:K'{RN1}-{RN2}-{RN3};".format(
            RN1=directory_number,
            RN2=line_number,
            RN3=tariff_level
        )
        content = self.send_command(command)
        return self.decoder.decode_content(content)

    def get_admin_incoming_call_barring(self, directory_number, line_number, tariff_level):
        command = "RD-ICB:K'{RN1}-{RN2}-{RN3};".format(
            RN1=directory_number,
            RN2=line_number,
            RN3=tariff_level
        )
        content = self.send_command(command)
        return self.decoder.decode_content(content)

    def remove_admin_incoming_call_barring(self, directory_number, line_number, tariff_level):
        command = "RD-ICB:K'{RN1}-{RN2}-{RN3};".format(
            RN1=directory_number,
            RN2=line_number,
            RN3=tariff_level
        )
        return self.send_command(command)
```