package com.comnord.bqsm.controller;

import com.comnord.bqsm.model.IconEntity;
import com.comnord.bqsm.model.dto.IconDTO;
import com.comnord.bqsm.service.IconServices;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/icons")
public class IconControllers {

    @Autowired
    private IconServices iconServices;

    @GetMapping("/")
    public ResponseEntity<List<IconDTO>> getAllIcons() {
        List<IconEntity> icons = (List<IconEntity>) iconServices.getAllIcons();
        List<IconDTO> dtos = icons.stream()
                .map(icon -> new IconDTO(icon.getId(), icon.getIconName(), icon.getIcon()))
                .toList();
        return ResponseEntity.ok(dtos);
    }

    @GetMapping("/get-one")
    public ResponseEntity<IconDTO> getIconById(@RequestParam int id) {
        IconEntity icon = iconServices.getIconById(id);
        IconDTO dto = new IconDTO(icon.getId(), icon.getIconName(), icon.getIcon());
        return ResponseEntity.ok(dto);
    }

    @PostMapping("/create")
    public ResponseEntity<IconEntity> saveIcon(@RequestBody IconEntity icon) {
        IconEntity saved = iconServices.saveIcon(icon);
        return new ResponseEntity<>(saved, HttpStatus.CREATED);
    }

    @PutMapping("/update")
    public ResponseEntity<IconEntity> updateIcon(@RequestParam int id, @RequestBody IconEntity icon) {
        IconEntity updated = iconServices.updateIcon(id, icon);
        return ResponseEntity.ok(updated);
    }

    @DeleteMapping("/delete")
    public ResponseEntity<String> deleteIconById(@RequestParam int id) {
        iconServices.deleteIconById(id);
        return ResponseEntity.ok("icon deleted successfully");
    }
}